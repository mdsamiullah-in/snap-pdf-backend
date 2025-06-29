

const Exc = (fn)=>(req, res,  next)=>{
    Promise.resolve(fn(req, res, next)).catch((err)=>{
        res.status(500).json({
            message: process.env.NODE_ENV === "dev" ? err.message : "failed ! please try after sometime"
        })
    })
}

export default Exc