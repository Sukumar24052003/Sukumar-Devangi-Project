


import mongoose from 'mongoose';

const { Schema, model } = mongoose;

const spaceSchema = new Schema({
  spaceName: { type: String }, // removed `required`
  landlord: { type: String },
  peerMediaOwner: { type: String },
  spaceType: { type: String, enum: ['Billboard', 'DOOH','Gantry','Pole Kiosk'] }, // removed `required`
  traded: { type: Boolean, default: false },
  category: { type: String, enum: ['Retail', 'Transit'] }, // removed `required`
  mediaType: { type: String, enum: ['Static', 'Digital',""],default:"" }, // removed `required`
  price: { type: Number },
  footfall: { type: Number },
  audience: { type: String, enum: ['Youth', 'Working Professionals'] },
  demographics: { type: String, enum: ['Urban', 'Rural'] },
  description: { type: String },
  illuminations: { type: String, enum: ['Front lit', 'Back lit','Non lit'] },

  unit: { type: Number,default:1 }, // removed custom validator

  occupiedUnits: { type: Number, default: 0 }, // removed validator

  width: { type: Number },
  height: { type: Number },
  additionalTags: { type: String },
  previousBrands: { type: String },
  tags: { type: String },
  address: { type: String },
  city: { type: String },
  state: { type: String }, // removed enum
  latitude: { type: String },
  longitude: { type: String },
  landmark: { type: String },
  zone: { type: String }, // removed enum
  ownershipType: { type: String }, // removed enum
  tier: { type: String }, // removed enum
  faciaTowards: { type: String },
  overlappingBooking: { type: Boolean, default: false },

  mainPhoto: String,
  inventory: { type: String },
  longShot: { type: String },
  closeShot: { type: String },

  printingStatus: {
    confirmed: { type: Boolean, default: false },
    printingDate:{type: String,default:''},
    printingMaterial:{type:String,default:''},
    assignedPerson:{type:String,default:''},
    assignedAgency:{type:String,default:''},
    note:{type:String}
  },
  numberOfBookings:{type:Number,default:0},
  totalBookingValue:{type:Number,default:0},
  mountingStatus: {
    confirmed: { type: Boolean, default: false },
    mountingDate:{type: String,default:''},
    assignedPerson:{type:String,default:''},
    assignedAgency:{type:String,default:''},
    note:{type:String}
  },

  otherPhotos: [String],

  availability: {
    type: String,
    default: 'Completely available',
  }, 

  dates: [{ type: String }], 
  campaignDates: [{
  startDate: { type: String,  },
  endDate: { type: String,  }
}],
}, {
  timestamps: true
});

const Space = model('Space', spaceSchema);

export default Space;
