const mongoose = require('mongoose');

const trackingEventSchema = new mongoose.Schema(
  {
    stage: {
      type: String,
      enum: ['loading_in', 'loading_out', 'in_transit', 'unloading_in', 'unloading_out', 'delivered'],
      required: true,
    },
    location: { type: String, default: '' },   // city / checkpoint name
    remark:   { type: String, default: '' },   // optional note by staff
    updatedBy: { type: String, default: '' },  // staff name who updated
    timestamp: { type: Date, default: Date.now },
  },
  { _id: true }
);

const gpsPingSchema = new mongoose.Schema(
  {
    lat: { type: Number, required: true },
    lng: { type: Number, required: true },
    speed: { type: Number, default: 0 },
    locationName: { type: String, default: '' },
    timestamp: { type: Date, default: Date.now },
  },
  { _id: true }
);

const notificationSchema = new mongoose.Schema(
  {
    type: { type: String, enum: ['WHATSAPP', 'SMS', 'EMAIL'], default: 'WHATSAPP' },
    recipient: { type: String, required: true },
    message: { type: String, required: true },
    status: { type: String, enum: ['SENT', 'DELIVERED', 'FAILED'], default: 'SENT' },
    sentAt: { type: Date, default: Date.now },
  },
  { _id: true }
);

const tripSchema = new mongoose.Schema(
  {
    company: { type: mongoose.Schema.Types.ObjectId, ref: 'Company', required: true },
    truck:   { type: mongoose.Schema.Types.ObjectId, ref: 'Truck', required: true },
    bilty:   { type: mongoose.Schema.Types.ObjectId, ref: 'Bilty' },
    party:   { type: mongoose.Schema.Types.ObjectId, ref: 'Party' },

    tripId:          { type: String },
    fromCity:        { type: String },
    toCity:          { type: String },
    routeDistance:   { type: String },
    vehicleCapacity: { type: String },
    shipmentItem:    { type: String },
    driverName:      { type: String },

    rateType:       { type: String, default: 'FIXED' },
    gstPercent:     { type: Number, default: 0 },
    customerAmount: { type: Number, default: 0 },

    startDate: { type: String },
    endDate:   { type: String },

    // 6-stage tracking pipeline
    status: {
      type: String,
      enum: ['loading_in', 'loading_out', 'in_transit', 'unloading_in', 'unloading_out', 'delivered'],
      default: 'loading_in',
    },

    // Full history of every stage update
    trackingEvents: { type: [trackingEventSchema], default: [] },

    // Level 4: Live GPS tracking data
    currentGps: {
      lat: { type: Number },
      lng: { type: Number },
      speed: { type: Number, default: 0 },
      locationName: { type: String, default: '' },
      lastUpdated: { type: Date },
    },
    gpsPings: { type: [gpsPingSchema], default: [] },

    // Level 3: Notification logs (WhatsApp / SMS)
    notificationsSent: { type: [notificationSchema], default: [] },
  },
  { timestamps: true }
);

tripSchema.index({ company: 1, createdAt: -1 });
tripSchema.index({ company: 1, truck: 1 });
tripSchema.index({ company: 1, status: 1 });

module.exports = mongoose.model('Trip', tripSchema);

