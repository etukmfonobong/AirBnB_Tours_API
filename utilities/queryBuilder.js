class queryBuilder {
  constructor(builtQuery, requestQuery) {
    this.requestQuery = requestQuery
    this.builtQuery = builtQuery
  }

  filter() {
    const filterObject = {...this.requestQuery}//create a shallow copy of the requestQuery using destructuring

    //exclude special fields
    const excludeFields = ['page', 'sort', 'limit', 'fields', 'search'];
    excludeFields.forEach(el => delete filterObject[el]);

    //Add Mongo operator '$' to request.query if (gte,gt,lte,lt) exist
    let filterString = JSON.stringify(filterObject);
    filterString = filterString.replace(/\b(gte|gt|lte|lt)\b/g, match => `$${match}`);
    this.builtQuery = this.builtQuery.find(JSON.parse(filterString));

    return this;
  }

  sort() {
    if (this.requestQuery.sort) {
      const sortBy = this.requestQuery.sort.split(',').join(' ');
      this.builtQuery = this.builtQuery.sort(sortBy);
    } else {
      this.builtQuery = this.builtQuery.sort('-createdAt');
    }
    return this;
  }

  selectFields() {
    if (this.requestQuery.fields) {
      const selectBy = this.requestQuery.fields.split(',').join(' ');
      this.builtQuery = this.builtQuery.select(selectBy);
    } else {
      this.builtQuery = this.builtQuery.select('-__v');
    }
    return this;
  }

  paginate() {
    const page = Number(this.requestQuery.page) || 1;
    const limit = Number(this.requestQuery.limit) || 1000;
    const skip = (page - 1) * limit;

    this.builtQuery = this.builtQuery.skip(skip).limit(limit);

    return this;
  }

  search() {
    if (this.requestQuery.search) {

      const searchQuery = {
        $or: [
          {
            name: {
              $regex: `${this.requestQuery.search}`,
              $options: 'i'
            }
          },
          {
            summary: {
              $regex: `${this.requestQuery.search}`,
              $options: 'i'
            }
          },
          {
            tour: `${this.requestQuery.search}`
          },
          {
            user: `${this.requestQuery.search}`
          }
        ]
      };
      this.builtQuery = this.builtQuery.find(searchQuery);
    }

    return this;
  }
}

module.exports = queryBuilder;
