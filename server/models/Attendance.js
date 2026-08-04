const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema(
  {
    company: { type: mongoose.Schema.Types.ObjectId, ref: 'Company', required: true },
    date: { type: Date, required: true },
    personType: { type: String, enum: ['Driver', 'Staff'], required: true },
    driver: { type: mongoose.Schema.Types.ObjectId, ref: 'Driver' },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    personName: { type: String, required: true, trim: true },
    status: { type: String, enum: ['Present', 'Absent', 'Leave'], required: true, default: 'Present' },
    notes: { type: String, trim: true },
  },
  { timestamps: true }
);

attendanceSchema.index({ company: 1, date: 1 });

module.exports = mongoose.model('Attendance', attendanceSchema);
