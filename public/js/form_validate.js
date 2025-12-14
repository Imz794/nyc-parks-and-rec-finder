//Form validation for parks and rec finder

const validate = 
{

  //helper function to trim and check if string is empty
  checkString(str, fieldName)
  {
    if(!str)
    {
      throw `${fieldName} must be provided`;
    }
    if(typeof str !== 'string')
    {
      throw `${fieldName} must be a string`;
    }
    str = str.trim();
    if(str.length === 0)
    {
      throw '$(fieldname) cannot be empty;
    }
    return str;
  },

  //helper function to validate email for user page
  checkEmail(email)
  {
    email = this.checkString(email, 'Email');
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if(!emailRegex.test(email))
    {
      throw 'email format is invalid';
    }
    return email.toLowerCase();
  },

  //helper to check password for user page
  checkPass(password)
  {
    password = this.checkString(password, 'Password');
    //imma make minimum password be like same requirements as lab 10
    if(password.length < 8)
    {
      throw 'Password must be at least 8 characters long';
    }
    if (!/[A-Z]/.test(password)) 
    {
      throw 'Password must contain at least one uppercase letter';
    }
    if (!/[0-9]/.test(password)) 
    {
      throw 'Password must contain at least one number';
    }
    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) 
    {
      throw 'Password must contain at least one special character';
    }
    if (/\s/.test(password)) 
    {
      throw 'Password cannot contain spaces';
    }
    return password;
  },

    //helper that will validate user username
  checkUsername(uname)
  {
    uname = this.checkString(uname, 'Username');
    //just require it to be greater than 3 characters and no character restrictions unless we need it
    if(uname.length < 3)
    {
      throw 'Username must be greater than 3 characters';
    }
    return uname;
  },

  //helper to validate NYC borough for filtering
  checkBorough(borough)
  {
    borough = this.checkString(borough, 'Borough');
    const validBoroughs = ['manhattan', 'brooklyn', 'queens', 'bronx', 'staten island'];
    if(!validBoroughs.includes(borough.toLowerCase()))
    {
      throw 'Invalid borough. Must be Manhattan, Brooklyn, Queens, Bronx, or Staten Island';
    }
    return borough.toLowerCase();
  },

  //Form validation for parks and rec finder
const validate = 
{
  //helper function to trim and check if string is empty
  checkString(str, fieldName)
  {
    if(!str)
    {
      throw `${fieldName} must be provided`;
    }
    if(typeof str !== 'string')
    {
      throw `${fieldName} must be a string`;
    }
    str = str.trim();
    if(str.length === 0)
    {
      throw `${fieldName} cannot be empty`;
    }
    return str;
  },

  //helper function to validate email for user page
  checkEmail(email)
  {
    email = this.checkString(email, 'Email');
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if(!emailRegex.test(email))
    {
      throw 'Email format is invalid';
    }
    return email.toLowerCase();
  },

  //helper to check password for user page
  checkPass(password)
  {
    password = this.checkString(password, 'Password');
    if(password.length < 8)
    {
      throw 'Password must be at least 8 characters long';
    }
    if (!/[A-Z]/.test(password)) 
    {
      throw 'Password must contain at least one uppercase letter';
    }
    if (!/[0-9]/.test(password)) 
    {
      throw 'Password must contain at least one number';
    }
    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) 
    {
      throw 'Password must contain at least one special character';
    }
    if (/\s/.test(password)) 
    {
      throw 'Password cannot contain spaces';
    }
    return password;
  },

  //helper that will validate user username
  checkUsername(uname)
  {
    uname = this.checkString(uname, 'Username');
    if(uname.length < 3)
    {
      throw 'Username must be at least 3 characters';
    }
    return uname;
  },

  //helper to validate NYC borough for filtering
  checkBorough(borough)
  {
    borough = this.checkString(borough, 'Borough');
    const validBoroughs = ['manhattan', 'brooklyn', 'queens', 'bronx', 'staten island'];
    if(!validBoroughs.includes(borough.toLowerCase()))
    {
      throw 'Invalid borough. Must be Manhattan, Brooklyn, Queens, Bronx, or Staten Island';
    }
    return borough.toLowerCase();
  },

  //helper to validate facility type for filtering
  checkFacilityType(facilityType)
  {
    facilityType = this.checkString(facilityType, 'Facility type');
    const validTypes = [
      'recreation center',
      'park',
      'pool',
      'playground',
      'sports field',
      'basketball court',
      'tennis court',
      'baseball field',
      'soccer field',
      'fitness center',
      'community center',
      'track',
      'gym',
      'other'
    ];
    if(!validTypes.includes(facilityType.toLowerCase()))
    {
      throw 'Invalid facility type';
    }
    return facilityType.toLowerCase();
  },

  //helper to validate amenities (can be array or single string)
  checkAmenities(amenities)
  {
    if(!Array.isArray(amenities))
    {
      if(typeof amenities === 'string')
      {
        amenities = [amenities];
      }
      else
      {
        throw 'Amenities must be an array or string';
      }
    }

    const validAmenities = [
      'basketball court',
      'tennis court',
      'swimming pool',
      'playground',
      'fitness equipment',
      'running track',
      'soccer field',
      'baseball field',
      'restrooms',
      'water fountain',
      'parking',
      'wheelchair accessible',
      'locker rooms',
      'showers',
      'picnic area',
      'dog run'
    ];

    const sanitized = amenities.map(a => {
      if(typeof a !== 'string')
      {
        throw 'Each amenity must be a string';
      }
      a = a.trim().toLowerCase();
      if(!validAmenities.includes(a))
      {
        throw `Invalid amenity: ${a}`;
      }
      return a;
    });

    return sanitized;
  },

  //helper to validate search query
  checkSearchQuery(query)
  {
    query = this.checkString(query, 'Search query');
    if(query.length < 2)
    {
      throw 'Search query must be at least 2 characters';
    }
    if(query.length > 100)
    {
      throw 'Search query cannot exceed 100 characters';
    }
    return query;
  },

  //helper to validate rating (1-5 stars)
  checkRating(rating)
  {
    if(typeof rating === 'string')
    {
      rating = parseInt(rating);
    }
    if(!Number.isInteger(rating))
    {
      throw 'Rating must be a whole number';
    }
    if(rating < 1 || rating > 5)
    {
      throw 'Rating must be between 1 and 5';
    }
    return rating;
  },

  //helper to validate review text
  checkReview(review)
  {
    review = this.checkString(review, 'Review');
    if(review.length < 3)
    {
      throw 'Review must be at least 3 characters or one word';
    }
    if(review.length > 1000)
    {
      throw 'Review cannot exceed 1000 characters';
    }
    return review;
  },

  //helper to validate facility name
  checkFacilityName(name)
  {
    name = this.checkString(name, 'Facility name');
    if(name.length < 2)
    {
      throw 'Facility name must be at least 2 characters';
    }
    if(name.length > 200)
    {
      throw 'Facility name cannot exceed 200 characters';
    }
    return name;
  },

  //helper to validate address
  checkAddress(address)
  {
    address = this.checkString(address, 'Address');
    if(address.length < 5)
    {
      throw 'Address must be at least 5 characters';
    }
    if(address.length > 200)
    {
      throw 'Address cannot exceed 200 characters';
    }
    return address;
  },

  //helper to validate phone number
  checkPhone(phone)
  {
    phone = this.checkString(phone, 'Phone number');
    const digitsOnly = phone.replace(/\D/g, '');
    if(digitsOnly.length !== 10)
    {
      throw 'Phone number must be 10 digits';
    }
    return digitsOnly;
  },

  //helper to validate hours of operation
  checkHours(hours)
  {
    hours = this.checkString(hours, 'Hours');
    const timeRegex = /\d{1,2}:\d{2}\s?(AM|PM|am|pm)/i;
    if(!timeRegex.test(hours))
    {
      throw 'Invalid hours format. Use format like "9:00 AM - 5:00 PM"';
    }
    return hours;
  },
  
      
    
  


