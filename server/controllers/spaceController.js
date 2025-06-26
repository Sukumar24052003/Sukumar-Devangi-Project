import Space from "../models/space.model.js";
import { uploadToS3 } from "../utils/s3uploader.js";


// export const createSpace = async (req, res) => {
//     try {
//       const {
//         body,
//         files: { mainPhoto, longShot, closeShot, otherPhotos },
//       } = req;
  
//       // Convert to numbers
//       const price = parseFloat(body.price);
//       const footfall = parseInt(body.footfall);
//       const unit = parseInt(body.unit);
  
//       // Backend validation: Enforce unit limits
//       const maxUnitMap = {
//         Billboard: 2,
//         DOOH: 10,
//         'Pole kiosk': 10,
//         Gantry: 1,
//       };
//       const allowedUnit = maxUnitMap[body.spaceType];
//       if (allowedUnit !== undefined && unit > allowedUnit) {
//         return res.status(400).json({
//           error: `Unit exceeds limit. Max allowed units for ${body.spaceType} is ${allowedUnit}.`,
//         });
//       }
// console.log("Main photo path:", mainPhoto[0].path);  // ✅ Confirm it's not undefined


// //       const s3Upload = async (file) => {
// //       if (!file) return null;
// //       const filePath = file.path;
// //       const s3Key = file.filename;
// //       return await uploadToS3(filePath, s3Key);
// //     };

   

// // const mainPhotoUrl = await uploadToS3(mainPhoto[0].path, mainPhoto[0].filename);
// // const longShotUrl = await uploadToS3(longShot[0].path, longShot[0].filename);
// // const closeShotUrl = await uploadToS3(closeShot[0].path, closeShot[0].filename);

// // const otherPhotosUrls = await Promise.all(
// //   otherPhotos.map(file => uploadToS3(file.path, file.filename))
// // );

  
//       const space = new Space({
//         ...body,
//         price,
//         footfall,
//         unit,
//         traded: body.traded === 'true', // Convert from string to boolean
//         mainPhoto: mainPhoto?.[0]?.filename,
//         longShot: longShot?.[0]?.filename,
//         closeShot: closeShot?.[0]?.filename,
//         otherPhotos: otherPhotos?.map((f) => f.filename) || [],
//         dates: [body.startDate, body.endDate]
//       });
  
//       const saved = await space.save();
//       res.status(201).json({ message: 'Space created', data: saved });
//     } catch (error) {
//       console.error(error);
//       res.status(500).json({ error: 'Failed to create space', details: error.message });
//     }
//   };


export const createSpace = async (req, res) => {
  try {
    const { body, files } = req;
   console.log("Incoming Space body is",body);
    const price = parseFloat(body.price);
    const footfall = parseInt(body.footfall);
    let unit = parseInt(body.unit, 10);
if (isNaN(unit)) {
  unit = 1;
}

    const maxUnitMap = {
      Billboard: 1,
      DOOH: 10,
      'Pole kiosk': 10,
      Gantry: 1,
    };

    const allowedUnit = maxUnitMap[body.spaceType];
    if (allowedUnit !== undefined && unit > allowedUnit) {
      return res.status(400).json({
        error: `Unit exceeds limit. Max allowed units for ${body.spaceType} is ${allowedUnit}.`,
      });
    }

    // ✅ Safe upload helper
    const safeUpload = async (file) => {
      if (file && file.path) {
        console.log("Uploading:", file.path);
        return await uploadToS3(file.path, file.filename);
      }
      return null;
    };

    const mainPhotoUrl = await safeUpload(files?.mainPhoto?.[0]);
    const longShotUrl = await safeUpload(files?.longShot?.[0]);
    const closeShotUrl = await safeUpload(files?.closeShot?.[0]);

    const otherPhotos = files?.otherPhotos || [];
    const otherPhotosUrls = await Promise.all(
      otherPhotos.map((file) => safeUpload(file))
    );

    const space = new Space({
      ...body,
      price,
      footfall,
      unit,
      traded: body.traded === 'true',
      mainPhoto: mainPhotoUrl,
      longShot: longShotUrl,
      closeShot: closeShotUrl,
      otherPhotos: otherPhotosUrls,
      dates: [body.startDate, body.endDate],
    });

    const saved = await space.save();
    res.status(201).json({ message: 'Space created', data: saved });
  } catch (error) {
    console.error("Create Space Error:", error.message);
    res.status(500).json({ error: 'Failed to create space', details: error.message });
  }
};
