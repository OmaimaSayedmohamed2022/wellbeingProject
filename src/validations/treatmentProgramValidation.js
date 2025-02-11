export const validateTreatmentProgram = (data) => {
    const errors = {};
  
    if (!data.name || typeof data.name !== "string" || data.name.trim() === "") {
      errors.name = "Program name is required and must be a valid string";
    }
  
    if (!data.importance || typeof data.importance !== "string" || data.importance.trim() === "") {
      errors.importance = "Program importance is required and must be a valid string";
    }
  
    if (!data.treatmentPlan || typeof data.treatmentPlan !== "string" || data.treatmentPlan.trim() === "") {
      errors.treatmentPlan = "Treatment plan is required and must be a valid string";
    }
  
    if (!data.goals || typeof data.goals !== "string" || data.goals.trim() === "") {
      errors.goals = "Goals are required and must be a valid string";
    }
  
    if (data.stages && !Array.isArray(data.stages)) {
      errors.stages = "Stages must be an array";
    }
  
    if (data.techniques && !Array.isArray(data.techniques)) {
      errors.techniques = "Techniques must be an array";
    }
  
    if (data.sessions && !Array.isArray(data.sessions)) {
      errors.sessions = "Sessions must be an array";
    }
  
    if (data.skillTraining && !Array.isArray(data.skillTraining)) {
      errors.skillTraining = "Skill training must be an array";
    }
  
    return Object.keys(errors).length > 0 ? errors : null;
  };
  