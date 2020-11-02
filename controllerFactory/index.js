const queryBuilder = require('./../utilities/queryBuilder')
const customError = require('./../utilities/errorBuilder')
const {filterOutUnwantedFields} = require('./../utilities/globalMethods')

exports.getAll = (Model) => {
  return async (req, res, next) => {
    try {
      //try to get all documents
      const query = new queryBuilder(Model, req.query)
      query.search()
        .filter()
        .sort()
        .selectFields()
        .paginate()

      const documents = await query["builtQuery"].find(req.filterForOne)//filier is here to allow use of nested routes
      //if successful send back response with all documents
      await res.status(200)
        .json({
          status: 'success',
          results: documents.length,
          data: {
            documents
          }
        })
    } catch (e) {
      //create an error message if an error occurs
      next(e)
    }
  }
}

exports.getOne = (Model, populateOptions) => {
  return async (req, res, next) => {
    try {
      //try to get tour by id
      let query = Model.findById(req.params.id)
      if (populateOptions) query = query.populate(populateOptions)
      const document = await query

      //if we can't find a document create an error
      if (!document) {
        return next(new customError('could not find a document with that id', 404))
      }
      //if successful send back response with document
      await res.status(200)
        .json({
          status: 'success',
          data: {
            document
          }
        })
    } catch (e) {
      //create an error message if an error occurs
      next(e)
    }
  }
}

exports.createOne = (Model) => {
  return async (req, res, next) => {
    try {
      //try to create and save new document
      const document = await Model.create(req.body)
      //if successful send back response with new document object
      await res.status(201)
        .json({
          status: 'success',
          data: {
            document
          }
        })
    } catch (e) {
      //create an error message if an error occurs
      next(e)
    }
  }
}


exports.updateOne = (Model, allowedFieldsOptions = []) => {
  return async (req, res, next) => {
    //check if user in document is the same as user in req
    const check = await Model.findById(req.params.id)
    if (check.user) {
      if (String(check.user.id) !== String(req.user._id)) {
        return next(new customError("Unauthourized, cannot update other user's document", 401))
      }
    }

    //try to get document by id
    try {
      //filter out unwanted fields
      const filteredBody = filterOutUnwantedFields(req.body, allowedFieldsOptions)

      const document = await Model.findByIdAndUpdate(req.params.id, filteredBody, {
        new: true,
        runValidators: true
      })

      //if we can't find a document create an error
      if (!document) {
        return next(new customError('could not find a document with that id', 404))
      }
      //if successful send back response with document
      await res.status(200)
        .json({
          status: 'success',
          data: {
            document
          }
        })
    } catch (e) {
      //create an error message if an error occurs
      next(e)
    }
  }
}


exports.deleteOne = (Model) => {
  return async (req, res, next) => {
    //check if user in document is the same as user in req
    const check = await Model.findById(req.params.id)
    if (check && check.user) {
      if (String(check.user.id) !== String(req.user._id)) {
        return next(new customError("Unauthourized, cannot update other user's document", 401))
      }
    }

    //try to get document by id
    try {
      await Model.findByIdAndDelete(req.params.id)

      //if successful send back response
      await res.status(204)
        .json({
          status: 'success',
          data: null
        })
    } catch (e) {
      //create an error message if an error occurs
      next(e)
    }
  }
}


