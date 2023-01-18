// returns 200 if server is ready
const health = async (req, res) => {
    try {
        res.status(200).json({ "ready": true });
    } catch (error) {
        res.status(400).json({ error: error.message });
        console.log(res)
    }
};


module.exports = { health };
