import { Beneficiary } from '../models/beneficiaryModel.js';
import Specialist from '../models/specialistModel.js';
import { Admin } from '../models/adminModel.js';

export const userMiddleware = async (req, res, next) => {
    const { email } = req.body;

    if (!email) {
        return res.status(400).json({ message: "Email is required" });
    }
    try {
        const user =
            await Beneficiary.findOne({ email }) ||
            await Specialist.findOne({ email })||
            await Admin.findOne({ email });

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        req.user = user; 
        next();
    } catch (error) {
        console.error("Error in UserMiddleware:", error);
        res.status(500).json({ message: "Internal server error", error: error.message });
    }
};
