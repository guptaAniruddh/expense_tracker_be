import createHttpError from "http-errors";
import multer from "multer";

export const upload = multer({
        
        dest: 'uploads/',
        limits: {
         fileSize: 10000000
        },
        fileFilter(req,file,cb){
           if(!file.originalname.match(/\.(csv)$/))
           throw createHttpError(400,"Please send a csv file");
         cb(null,true)
        }
        
});

