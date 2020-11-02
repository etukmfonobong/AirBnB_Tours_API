const Tour = require('./../models/tourModel')//tour model import
const controllerFactory = require('./../controllerFactory')
const customError = require('./../utilities/errorBuilder')

//get all tours
exports.getAllTours = controllerFactory.getAll(Tour)

//create tour
exports.createTour = controllerFactory.createOne(Tour)

//get single tour
exports.getTour = controllerFactory.getOne(Tour, 'reviews guides')

//update single tour
exports.updateTour = controllerFactory.updateOne(Tour,
  ['name', 'difficulty', 'price', 'description', 'summary']
)

//delete single tour
exports.deleteTour = controllerFactory.deleteOne(Tour)

//get tours within a certain radius
exports.getToursWithin = async (req, res, next) => {
  const {distance, latlng, unit} = req.params;
  const [lat, lng] = latlng.split(',');

  if (!lat || !lng) {
    next(new customError('Please provide latitude and longitude in the format lat,lng', 400));
  }

  const radius = unit === 'mi' ? distance / 3963.2 : distance / 6378.1;

  try {
    const tours = await Tour.find({
      startLocation: {$geoWithin: {$centerSphere: [[lng, lat], radius]}}
    })

    await res.status(200).json({
      status: 'success',
      results: tours.length,
      data: {
        data: tours
      }
    })
  } catch (e) {
    next(e)
  }
}

//get distances
exports.getDistances = async (req, res, next) => {
  const {latlng, unit} = req.params;
  const [lat, lng] = latlng.split(',');
  const multiplier = unit === 'mi' ? 0.000621371 : 0.0001;

  if (!lat || !lng) {
    next(new customError('Please provide latitude and longitude in the format lat,lng', 400));
  }
  try {
    const distances = await Tour.aggregate([
      {
        $geoNear: {
          near: {
            type: 'point',
            coordinates: [Number(lng), Number(lat)]
          },
          distanceField: 'distance',
          distanceMultiplier: multiplier // show result in KM
        }
      },
      {
        $project: {
          distance: 1,
          name: 1
        }
      }
    ]);

    await res.status(200).json({
      status: 'success',
      data: {
        data: distances
      }
    });
  } catch (e) {
    next(e)
  }
};

/**
 * Get/aggregate tour stats by difficulty
 * @param req
 * @param res
 * @param next
 * @returns {Promise<void>}
 */
exports.getToursStats = async (req, res, next) => {
  try {
    const stats = await Tour.aggregate([
      {
        $match: {ratingsAverage: {$gte: 4.5}}
      },
      {
        $group: {
          _id: '$difficulty',
          num: {$sum: 1},
          numRatings: {$sum: '$ratingsQuantity'},
          avgRating: {$avg: '$ratingsAverage'},
          avgPrice: {$avg: '$price'},
          minPrice: {$min: '$price'},
          maxPrice: {$max: '$price'}
        },
      },
      {
        $sort: {avgPrice: 1}
      }
    ])

    await res.status(200)
      .json({
        status: 'success',
        data: {
          stats
        }
      })
  } catch (e) {
    //if unsuccessful send back response with error message
    next(e)
  }
}

/**
 * Gets list of the busiest months in a given year
 * @param req
 * @param res
 * @param next
 * @returns {Promise<void>}
 */
exports.getMonthlyPlan = async (req, res, next) => {
  try {
    const year = req.params.year * 1

    const plan = await Tour.aggregate([
      {
        $unwind: '$startDates'
      },
      {
        $match: {
          startDates: {
            $gte: new Date(`${year}-01-01`),
            $lte: new Date(`${year}-12-31`)
          }
        }
      },
      {
        $group: {
          _id: {$month: '$startDates'},
          numTourStarts: {$sum: 1},
          tours: {$push: '$name'}
        }
      },
      {
        $addFields: {month: '$_id'}
      },
      {
        $project: {
          _id: 0
        }
      },
      {
        $sort: {
          numTourStarts: -1
        }
      }
    ])

    await res.status(200)
      .json({
        status: 'success',
        data: {
          plan
        }
      })
  } catch (e) {
    //if unsuccessful send back response with error message
    next(e)
  }
}