//  import { v2 as cloudinary } from 'cloudinary';
// import fs from 'fs';
//  import path from 'path';

//  cloudinary.config({ 
//    cloud_name: process.env.CLOUD_NAME,
//    api_key: process.env.API_KEY,
//    api_secret: process.env.API_SECRET,
//    secure: true,
//  });

// export const uploadOnCloudinary = async (base64Data) => {
//   let tempFilePath;
//   try {
//     if ( !base64Data) return null;



//     // Decode base64 and save to a file
//     const buffer = Buffer.from(base64Data.split(',')[1], 'base64'); // Split and remove the prefix

//     console.log("upload hone jaa raha hai clodinary pa");

//     let response = await cloudinary.uploader.upload(buffer, {
//       resource_type: 'auto',
//     });
//     console.log("upload hone k baad ka hisab h yuu");
//     // Remove the temporary file


//     return response;

//   } catch (error) {
//     if (tempFilePath && fs.existsSync(tempFilePath)) {

//     }
//     console.log("Error in Cloudinary upload:", error);
//     return null;
//   }

// }




// // export const uploadOnCloudinary = async (base64Data, fileName) => {
// //   try {
// //     if (!base64Data || !fileName) return null;

// //     const buffer = Buffer.from(base64Data.split(',')[1], 'base64');
// //     let resourceType = "auto";

// //     if (fileName.match(/\.(jpg|jpeg|png|gif)$/)) {
// //       resourceType = "image";
// //     } else if (fileName.match(/\.(mp4|avi|mkv|mov)$/)) {
// //       resourceType = "video";
// //     }

// //     const response =  cloudinary.uploader.upload_stream(
// //       { resource_type: resourceType },
// //       (error, result) => {
// //         if (error) throw error;
// //         return result;
// //       }
// //     ).end(buffer);

// //     return response;

// //   } catch (error) {
// //     console.log("Error in Cloudinary upload:", error);
// //     return null;
// //   }
// // }


import cloudinary from 'cloudinary';

// Configure Cloudinary
cloudinary.v2.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Function to upload a file to Cloudinary
export const uploadOnCloudinary = async (filePath) => {
  try {
    const uploadResult = await cloudinary.v2.uploader.upload(filePath, {
      folder: 'user_avatars', // Optional folder to organize uploads
    });
    return uploadResult;
  } catch (error) {
    console.error('File upload failed:', error.message); // More detailed error logging
    throw new Error('File upload failed');
  }
};








