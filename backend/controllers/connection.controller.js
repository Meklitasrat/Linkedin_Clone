import ConnectionRequest from "../models/connectionRequest.model.js";
import Notification from "../models/notification.model.js";
import User from "../models/user.model.js";

export const sendConnectionRequest = async(req , res) =>{
    try {
        const {userId} = req.params
        const senderId = req.user._id;

        if(senderId.toString() === userId){
            return res.status(400).json({message: 'You cannot send  a request to yourself'})
        }
        
        if(req.user.connections.includes(userId)){
            return res.status(400).json({message: 'You are already connected to this user'})
        }

        const existingRequest = await ConnectionRequest.findOne({
            sender: senderId,
            recipient: userId,
            status: 'pending'
        })

        if(existingRequest){
            return res.status(400).json({message: 'Request is already sent to this user'})
        }

        const newRequest = new ConnectionRequest({
            sender: senderId,
            recipient: userId,
            status: 'pending'
        })

        await newRequest.save();

        res.status(200).json({message: 'Connection request sent successfully'})

    } catch (error) {
        console.log('Error sending connection Request', error)
        res.status(500).json({message: error.message})
        
    }
}

export const acceptConnectionRequest = async(req , res) =>{
    try {

        const {requestId} = req.params
        const userId = req.user._id

        // we can find that specific connection and populate with some infos for our email
        const connection = await ConnectionRequest.findById(requestId)
        .populate('sender', 'name email username')
        .populate('recipient' , 'name username')

        if(!connection){
            return res.status(404).json({message: 'Connection request not found'})
        }

        // we cannot accept requests that are not for us
        if(connection.recipient._id.toString() !== userId.toString()){
            return res.status(403).json({message: 'You are not authorized to accept the request'})
        }
        
        if(connection.status !== 'pending'){
            return res.status(400).json({message: 'Request has already been processed'})
        }

        connection.status = 'accepted';

        await connection.save()

        // After setting the request to accepted we can update each users connection by pushing each ids in.
        await User.findByIdAndUpdate(connection.sender._id , {$addToSet: {connections: userId}})
        await User.findByIdAndUpdate(userId , {$addToSet: {connections: connection.sender._id}})

        // send notification to sender

        const notification = new Notification({
            recipient: connection.sender._id,
            relatedUser: userId,
            type: 'connectionAccepted'

        })
        
        await notification.save();
        res.json({ message: "Connection accepted successfully" });
        const senderEmail = connection.sender.email
        const senderName = connection.sender.name
        const recipientName = connection.recipient.name

        const profileUrl = process.env.CLIENT_URL + '/profile' + connection.recipient.username

        try {
            await sendConnectionAcceptedEmail(senderEmail , senderName , recipientName , profileUrl)
        } catch (error) {
            
        }

    } catch (error) {
        console.log('Error accepting connection Request', error)
        res.status(500).json({message: error.message})        
    }
}

export const rejectConnectionRequest = async(req , res) =>{
    try {
        const {requestId} = req.params;
        const userId = req.user._id

        const connection = await ConnectionRequest.findById(requestId)

        if(connection.recipient.toString() !== userId.toString()){
            return res.status(403).json({message: 'You are not authorized to reject this request'});
        }
        
        if(connection.status === 'rejected'){
            return res.status(400).json({message: 'You have already rejected this request'})
        }

        connection.status= 'rejected';
        await connection.save();

        res.status(200).json({message: 'Request rejected successfully'})
    } catch (error) {
        console.log('Error rejecting connection Request', error)
        res.status(500).json({message: error.message})
    }
}

export const getUserConnectionRequests = async(req , res) =>{
    try {
        const userId = req.user._id
        
        const requests = await ConnectionRequest.find({recipient: userId , status: 'pending'})
        .populate('sender', 'name , username, profilePicture headline connections')

        res.status(200).json(requests)
    } catch (error) {
        console.log('Error getting connection Request', error)
        res.status(500).json({message: error.message})
        
    }
}

export const getUserConnections = async(req , res) =>{
    try {
        const userId = req.user._id
        
        const user = await User.findById(userId)
        .populate('connections' , 'name username profilePicture headline connections')

        res.status(200).json(user)
    } catch (error) {
        console.log('Error getting connections', error)
        res.status(500).json({message: error.message})
        
    }
}


export const removeConnection = async(req , res) =>{
    try {   
        const myId = req.user._id;
        // the removed user id
        const {userId} = req.params;

        await User.findByIdAndUpdate(myId , {$pull: {connections: userId}});

        await User.findByIdAndUpdate(userId , {$pull: {connections:myId}})

        res.json({message: 'Connection request'});
        
    } catch (error) {
        console.log('Failed to remove connection', error.message);
        res.status(500).json({message: 'Server error'});
    }
}

export const getConnectionStatus = async(req , res) =>{
    try {
        const targetUserId = req.params.userId; 
        const currentUserId = req.user._id;

        const currentUser = req.user;

        if(currentUser.connections.includes(targetUserId)) {
            return res.json({status: "connected"})
        }

        const pendingRequest = await ConnectionRequest.findOne({
            $or: [
                {sender: currentUserId , recipient: targetUserId},
                {sender: targetUserId, recipient: currentUserId}
            ],
            status: 'pending'
        });

        if(pendingRequest){
            if(pendingRequest.sender.toString() === currentUserId.toString()){
                return res.json({status: 'pending', requestId: pendingRequest._id})
            }else{
                return res.json({status: 'received', requestId: pendingRequest._id})
            }
        };

        // if no connection is found between the users:

        res.json({status: 'not connected'}); 

    } catch (error) {
        console.log('Failed to get connection status', error.message);
        res.status(500).json({message: 'Server error'});
    }
}