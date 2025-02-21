import mongoose, { Schema } from 'mongoose'
import { IAddress } from '../../types/model'

const AddressSchema: Schema = new Schema(
    {   
        place_id: { type: Number, required: true },
        licence: { type: String, required: true },
        osm_type: { type: String, required: true },
        osm_id: { type: Number, required: true },
        lat: { type: String, required: true },
        lon: { type: String, required: true },
        display_name: { type: String, required: true },
        address: {
            house_number: { type: String },
            road: { type: String },
            neighbourhood: { type: String },
            suburb: { type: String },
            city: { type: String },
            county: { type: String },
            state: { type: String },
            postcode: { type: String },
            country: { type: String },
            country_code: { type: String }
        }
    },
    { timestamps: true }
)

export default mongoose.model<IAddress>('Address2', AddressSchema);