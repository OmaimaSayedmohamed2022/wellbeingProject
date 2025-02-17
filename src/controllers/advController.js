import Adv from'../models/advModel.js'
export const addAdvertisement =async (req, res) => {
    try{
    const {title ,photo,type}=req.body
    if(!title||!photo||!type){
        res.status(400).json({
            message :"All fields are required"})
    }
    const adv =await Adv.create(req.body)
    res.status(201).json({
     message :"A new Advertisment is added successfully" ,
     adv
    })
    }
    
    catch (error) {
        console.error('Error adding Advertisment :', error.message || error);
        res.status(500).json({ message: error.message || 'Internal server error.' });
      }
}



export const getAllAdvertisements = async (req, res) => {
    try {
        const advertisements = await Adv.find();
        return res.status(200).json(advertisements);
    } catch (error) {
        console.error("Error fetching Advertisements:", error);
        return res.status(500).json({ message: error.message || "Internal server error." });
    }
};


export const updateAdvertisement = async (req, res) => {
    try {
        const { id } = req.params;
        const updatedAdv = await Adv.findByIdAndUpdate(id, req.body, { new: true, runValidators: true });

        if (!updatedAdv) {
            return res.status(404).json({ message: "Advertisement not found" });
        }

        return res.status(200).json({ message: "Advertisement updated successfully", updatedAdv });
    } catch (error) {
        console.error("Error updating Advertisement:", error);
        return res.status(500).json({ message: error.message || "Internal server error." });
    }
};


export const deleteAdvertisement = async (req, res) => {
    try {
        const { id } = req.params;
        const deletedAdv = await Adv.findByIdAndDelete(id);

        if (!deletedAdv) {
            return res.status(404).json({ message: "Advertisement not found" });
        }

        return res.status(200).json({ message: "Advertisement deleted successfully" });
    } catch (error) {
        console.error("Error deleting Advertisement:", error);
        return res.status(500).json({ message: error.message || "Internal server error." });
    }
};
