import TreatmentProgram from '../models/treatmentProgramModel.js';
import logger from '../config/logger.js';
import {validateTreatmentProgram} from "../validations/treatmentProgramValidation.js";






export const addTreatmentProgram = async (req, res) => {
    try {
        const errors = validateTreatmentProgram(req.body);
        if (errors.length > 0) {
            logger.warn(`Validation errors: ${JSON.stringify(errors)}`);
            return res.status(400).json({ error: "Validation error", details: errors });
        }

        const { name, importance, treatmentPlan, goals, stages, techniques, skillTraining ,sessions} = req.body;

        const newProgram = new TreatmentProgram({
            name, 
            importance, 
            treatmentPlan, 
            goals, 
            stages, 
            techniques, 
            skillTraining,
            sessions
        });

        await newProgram.save();

        logger.info(`Treatment program "${name}" added successfully`);
        res.status(201).json({ message: "Treatment program added successfully", program: newProgram });
    } catch (error) {
        logger.error(`Error adding treatment program: ${error.message}`);
        res.status(500).json({ error: "Internal server error" });
    }
};


export const getTreatmentProgram = async (req, res) => {
    try {
        const programs = await TreatmentProgram.find()
            .populate({
                path: "sessions",
                select: "sessionType description sessionDate status",
            })
            .lean(); 

        if (!programs.length) {
            return res.status(404).json({ message: "No treatment programs found" });
        }

        res.status(200).json({ programs });
    } catch (error) {
        logger.error(`Error fetching treatment programs: ${error.message}`);
        res.status(500).json({ error: "Internal server error" });
    }
};

export const getTreatmentProgramByName = async (req, res) => {
    try {
        const { name } = req.params; 
        if (!name) {
            return res.status(400).json({ error: "Program name is required" });
        }

        const program = await TreatmentProgram.findOne({ name: new RegExp(name, "i") }) 
            .populate({
                path: "sessions",
                select: "sessionType description sessionDate status",
            })
            .lean();

        if (!program) {
            return res.status(404).json({ message: "No treatment program found with this name" });
        }

        res.status(200).json({ program });
    } catch (error) {
        logger.error(`Error fetching treatment program by name: ${error.message}`);
        res.status(500).json({ error: "Internal server error" });
    }
};
