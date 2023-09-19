export const ValidateData = (data) => {
    return Object.keys(data).filter(key => !data[key]);
}

export const ValidateRegister = (user) => {
    const {username, password, email, phone} = user;
    return ValidateData({username, password, email, phone});
}

export const ValidateLogin = (user) => {
    const {email, password} = user;
    return ValidateData({email, password});
}

export const validateForgetPassword = (user) => {
    const {email, newPassword} = user;
    return ValidateData({email, newPassword});
}

export const validateUpdateProfile = (user) => {
    const {username, phone} = user;
    return ValidateData({username, phone});
}

export const validateWallet = (user) => {
    const {userId, balance} = user;
    return ValidateData({userId, balance});
}

export const validateUpdateWallet = (user) => {
    const {userId, balance} = user;
    return ValidateData({userId, balance});
}

export const validateActivityInsert = (user) => {
    const {userId, actType, amount, detail} = user;
    return ValidateData({userId, actType, amount, detail});
}

export const validateActivityUpdate = (user) => {
    const {userId, actType, amount, detail} = user;
    return ValidateData({userId, actType, amount, detail});
}



