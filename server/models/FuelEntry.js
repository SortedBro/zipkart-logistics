const mongoose = require('mongoose');

const fuelEntrySchema = new mongoose.Schema(
  {
    company: { type: mongoose.Schema.Types.ObjectId, ref: 'Company', required: true },
    truck: { type: mongoose.Schema.Types.ObjectId, ref: 'Truck', required: true },
    trip: { type: mongoose.Schema.Types.ObjectId, ref: 'Trip' },
    date: { type: Date, required: true, default: Date.now },
    quantityLiters: { type: Number, required: true, min: 0 },
    ratePerLiter: { type: Number, required: true, min: 0 },
    totalAmount: { type: Number, required: true, min: 0 },
    odometerReading: { type: Number, required: true, min: 0 },
    fuelStationVendor: { type: String, trim: true },
    driver: { type: mongoose.Schema.Types.ObjectId, ref: 'Driver' },
    notes: { type: String, trim: true },
  },
  { timestamps: true }
);

fuelEntrySchema.index({ company: 1, date: -1 });

module.exports = mongoose.model('FuelEntry', fuelEntrySchema);
