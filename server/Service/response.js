const SendCreate = function (res, message, data) {
    res.status(201).json({status: true, message, data})
}

const SendSuccess = function (res, message, data) {
    res.status(200).json({status: true, message, data})
}

const SendError203 = function (res, message, error) {
    res.status(203).json({status: false, message, error, data: {}})
}

const SendError400 = function (res, message, error) {
    res.status(400).json({status: false, message, error, data: {}})
}

const SendError401 = function (res, message, error) {
    res.status(401).json({status: false, message, error, data: {}})
}

const SendError403 = function (res, message, error) {
    res.status(403).json({status: false, message, error, data: {}})
}

const SendError404 = function (res, message, error) {
    res.status(404).json({status: false, message, error, data: {}})
}

const SendError500 = function (res, message, error) {
    res.status(500).json({status: false, message, error, data: {}})
}

export {SendCreate, SendSuccess, SendError203, SendError400, SendError401, SendError404, SendError500, SendError403};