import Notification from "../models/notification.model.js"

export const getUserNotification = async(req , res) =>{
    try {
        const notification = await Notification.find({recipient: req.user._id}).sort({createdAt: -1})
        .populate('relatedUser', ' username name profilePicture')
        .populate('relatedPost', 'content image ')

        res.status(200).json(notification)

    } catch (error) {
        console.log('Error getting notification')
        res.status(500).json({message: error.message})
    }
}

export const markNotificationAsRead = async(req , res) =>{
    try {
        const notificationId = req.params.id;

        const notification = await Notification.findByIdAndUpdate(
            {_id: notificationId , recipient: req.user._id},
            {read: true},
            {new: true}
        );

        res.status(200).json(notification)
    } catch (error) {
        
    }
}

export const deleteNotification = async(req , res) =>{
    try {
        const notificationId = req.params.id

        await Notification.findByIdAndDelete(
            {_id: notificationId, recipient: req.user._id}
        )
        
        res.status(200).json('Notification deleted successfully');
    } catch (error) {
        console.log('Error deleting notification');
        res.status(500).json({message: error.message})
    }
}
