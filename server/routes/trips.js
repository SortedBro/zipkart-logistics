const express = require('express');
const Trip    = require('../models/Trip');
const Bilty   = require('../models/Bilty');
const { requireAuth } = require('../middleware/auth');
const asyncHandler    = require('../middleware/asyncHandler');

const router = express.Router();

// ─── Stage order for progression validation ───────────────────────────────────
const STAGE_ORDER = ['loading_in', 'loading_out', 'in_transit', 'unloading_in', 'unloading_out', 'delivered'];

// ─── GET /api/trips  — all trips for this company (auth required) ─────────────
router.get(
  '/',
  requireAuth,
  asyncHandler(async (req, res) => {
    const filter = { company: req.user.companyId };
    if (req.query.stage) filter.status = req.query.stage;

    const trips = await Trip.find(filter)
      .sort({ createdAt: -1 })
      .populate('truck', 'number')
      .populate('bilty', 'lrNumber fromCity toCity consignor consignee');
    res.json({ trips });
  })
);

// ─── POST /api/trips  — create a new trip ────────────────────────────────────
router.post(
  '/',
  requireAuth,
  asyncHandler(async (req, res) => {
    const {
      truck_id, bilty_id, party_id,
      from_city, to_city, start_date,
      tripId, routeDistance, vehicleCapacity,
      shipmentItem, driverName,
      rateType, gstPercent, customerAmount,
    } = req.body;

    if (!truck_id) return res.status(400).json({ error: 'Truck is required.' });

    const initialStage = 'loading_in';
    const trip = await Trip.create({
      company:        req.user.companyId,
      truck:          truck_id,
      bilty:          bilty_id   || undefined,
      party:          party_id   || undefined,
      fromCity:       from_city,
      toCity:         to_city,
      startDate:      start_date || new Date().toISOString().slice(0, 10),
      status:         initialStage,
      tripId,
      routeDistance,
      vehicleCapacity,
      shipmentItem,
      driverName,
      rateType:       rateType || 'FIXED',
      gstPercent:     parseFloat(gstPercent)     || 0,
      customerAmount: parseFloat(customerAmount) || 0,
      trackingEvents: [{
        stage:     initialStage,
        location:  from_city || '',
        remark:    'Shipment created',
        updatedBy: req.user.name || 'System',
        timestamp: new Date(),
      }],
    });
    res.status(201).json({ trip });
  })
);

// ─── GET /api/trips/:id  — single trip detail ────────────────────────────────
router.get(
  '/:id',
  requireAuth,
  asyncHandler(async (req, res) => {
    const trip = await Trip.findOne({ _id: req.params.id, company: req.user.companyId })
      .populate('truck', 'number vehicleType')
      .populate('bilty', 'lrNumber fromCity toCity consignor consignee material weight quantity')
      .populate('party', 'name phone');
    if (!trip) return res.status(404).json({ error: 'Trip not found.' });
    res.json({ trip });
  })
);

// ─── PATCH /api/trips/:id/stage  — advance stage + log tracking event ────────
router.patch(
  '/:id/stage',
  requireAuth,
  asyncHandler(async (req, res) => {
    const { stage, location = '', remark = '' } = req.body;

    if (!STAGE_ORDER.includes(stage)) {
      return res.status(400).json({ error: `Invalid stage. Must be one of: ${STAGE_ORDER.join(', ')}` });
    }

    const trip = await Trip.findOne({ _id: req.params.id, company: req.user.companyId });
    if (!trip) return res.status(404).json({ error: 'Trip not found.' });

    const currentIdx = STAGE_ORDER.indexOf(trip.status);
    const newIdx     = STAGE_ORDER.indexOf(stage);
    if (newIdx <= currentIdx) {
      return res.status(400).json({ error: 'Cannot move to a previous or same stage.' });
    }

    const newEvent = {
      stage,
      location,
      remark,
      updatedBy: req.user.name || 'Staff',
      timestamp: new Date(),
    };

    const update = {
      status: stage,
      $push:  { trackingEvents: newEvent },
    };
    if (stage === 'delivered') {
      update.endDate = new Date().toISOString().slice(0, 10);
    }

    const updated = await Trip.findOneAndUpdate(
      { _id: req.params.id, company: req.user.companyId },
      update,
      { new: true, runValidators: true }
    )
      .populate('truck', 'number')
      .populate('bilty', 'lrNumber fromCity toCity');

    res.json({ trip: updated });
  })
);

// ─── Level 4: PATCH /api/trips/:id/gps — Live GPS ping update (Staff / Telematics) ──
router.patch(
  '/:id/gps',
  requireAuth,
  asyncHandler(async (req, res) => {
    const { lat, lng, speed = 0, locationName = '' } = req.body;

    if (lat === undefined || lng === undefined) {
      return res.status(400).json({ error: 'Latitude and Longitude are required.' });
    }

    const gpsPing = {
      lat: parseFloat(lat),
      lng: parseFloat(lng),
      speed: parseFloat(speed) || 0,
      locationName: locationName || '',
      timestamp: new Date(),
    };

    const currentGps = {
      ...gpsPing,
      lastUpdated: new Date(),
    };

    const trip = await Trip.findOneAndUpdate(
      { _id: req.params.id, company: req.user.companyId },
      {
        currentGps,
        $push: { gpsPings: gpsPing },
      },
      { new: true }
    );

    if (!trip) return res.status(404).json({ error: 'Trip not found.' });
    res.json({ trip });
  })
);

// ─── Level 4: POST /api/trips/public/gps-update — Public Driver GPS Ping ─────
router.post(
  '/public/gps-update',
  asyncHandler(async (req, res) => {
    const { lrNumber, tripId, lat, lng, speed = 0, locationName = '' } = req.body;

    if (!lat || !lng) {
      return res.status(400).json({ error: 'Latitude and Longitude are required.' });
    }

    let tripFilter = null;
    if (lrNumber) {
      const bilty = await Bilty.findOne({ lrNumber: lrNumber.trim().toUpperCase() });
      if (bilty) tripFilter = { bilty: bilty._id };
    } else if (tripId) {
      tripFilter = { _id: tripId };
    }

    if (!tripFilter) {
      return res.status(400).json({ error: 'LR number or Trip ID is required.' });
    }

    const gpsPing = {
      lat: parseFloat(lat),
      lng: parseFloat(lng),
      speed: parseFloat(speed) || 0,
      locationName: locationName || '',
      timestamp: new Date(),
    };

    const trip = await Trip.findOneAndUpdate(
      tripFilter,
      {
        currentGps: { ...gpsPing, lastUpdated: new Date() },
        $push: { gpsPings: gpsPing },
      },
      { new: true }
    );

    if (!trip) return res.status(404).json({ error: 'Shipment trip not found.' });

    const io = req.app.get('io');
    if (io && lrNumber) {
      io.to(lrNumber.trim().toUpperCase()).emit('gps_update', {
        currentGps: trip.currentGps,
        gpsPings: trip.gpsPings,
      });
    }

    res.json({ success: true, currentGps: trip.currentGps });
  })
);

// ─── Level 3: POST /api/trips/:id/notify — Log WhatsApp / SMS alert ──────────
router.post(
  '/:id/notify',
  requireAuth,
  asyncHandler(async (req, res) => {
    const { type = 'WHATSAPP', recipient, message } = req.body;

    if (!recipient || !message) {
      return res.status(400).json({ error: 'Recipient phone/email and message are required.' });
    }

    const notif = {
      type,
      recipient,
      message,
      status: 'SENT',
      sentAt: new Date(),
    };

    const trip = await Trip.findOneAndUpdate(
      { _id: req.params.id, company: req.user.companyId },
      { $push: { notificationsSent: notif } },
      { new: true }
    );

    if (!trip) return res.status(404).json({ error: 'Trip not found.' });
    res.json({ success: true, notification: notif });
  })
);

// ─── GET /api/trips/public/track/:lrNumber — Public Tracking (Auth-Free) ─────
router.get(
  '/public/track/:lrNumber',
  asyncHandler(async (req, res) => {
    const lrNumber = req.params.lrNumber.trim().toUpperCase();

    const bilty = await Bilty.findOne({ lrNumber })
      .populate('company', 'name phone email city')
      .populate('truck',   'number vehicleType')
      .populate('party',   'name phone');

    if (!bilty) {
      return res.status(404).json({ error: 'LR number not found. Please check and try again.' });
    }

    const trip = await Trip.findOne({ bilty: bilty._id });

    const createdDate = bilty.createdAt || bilty.biltyDate || new Date();
    const deliveryStart = new Date(createdDate);
    deliveryStart.setDate(deliveryStart.getDate() + 3);
    const deliveryEnd = new Date(createdDate);
    deliveryEnd.setDate(deliveryEnd.getDate() + 5);

    const expectedDelivery = `${deliveryStart.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })} - ${deliveryEnd.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}`;
    const awbNumber = bilty.awbNumber || `AWB${String(bilty._id).slice(-10).toUpperCase()}`;

    const publicData = {
      lrNumber:   bilty.lrNumber,
      awbNumber,
      expectedDelivery,
      biltyDate:  bilty.biltyDate,
      fromCity:   bilty.fromCity,
      toCity:     bilty.toCity,
      consignor:  bilty.consignor,
      consignee:  bilty.consignee,
      material:   bilty.material,
      weight:     bilty.weight,
      quantity:   bilty.quantity,
      driverName: bilty.driverName,
      truck:      bilty.truck?.number || null,
      partyPhone: bilty.party?.phone || null,
      company: {
        name:  bilty.company?.name  || 'Zipkart Logistics',
        phone: bilty.company?.phone || '',
        city:  bilty.company?.city  || '',
      },
      status:         trip?.status         || 'loading_in',
      trackingEvents: trip?.trackingEvents || [],
      currentGps:     trip?.currentGps     || null,
      gpsPings:       trip?.gpsPings       || [],
      notificationsSent: (trip?.notificationsSent || []).map(n => ({
        type: n.type,
        sentAt: n.sentAt,
        status: n.status
      })),
      startDate:      trip?.startDate      || null,
      endDate:        trip?.endDate        || null,
    };

    res.json({ shipment: publicData });
  })
);

module.exports = router;
