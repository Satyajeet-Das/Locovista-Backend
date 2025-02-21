import mongoose from "mongoose";


export const ConvertToMongoId = (id: string) => {
    if(mongoose.Types.ObjectId.isValid(id)) {
        return new mongoose.Types.ObjectId(id);
    }
    else {
        throw new Error("Invalid Id");
    }
}
