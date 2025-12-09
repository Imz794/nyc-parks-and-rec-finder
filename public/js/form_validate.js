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
  
      
    
  

