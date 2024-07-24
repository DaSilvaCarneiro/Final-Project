const Message = require('../models/messageSchema');
const Flat = require('../models/flatSchema');
const User = require('../models/userSchema');

// Get Messages on Flat
const getMessage = async (req, res) => {
    try {
        const flatId = req.params.id;

        console.log(`Fetching messages for flat ID: ${flatId}`);

        const messages = await Message.find({ flatId }).sort({ createdAt: -1 });

        const senderIds = [...new Set(messages.map(message => message.senderId))];

        console.log(`Found ${senderIds.length} unique sender IDs:`, senderIds);

        const users = await User.find({ _id: { $in: senderIds } });

        const userMap = users.reduce((map, user) => {
            map[user._id] = { firstName: user.firstName, lastName: user.lastName };
            return map;
        }, {});

        const messagesWithUserDetails = messages.map(message => ({
            ...message.toObject(),
            user: userMap[message.senderId]
        }));

        console.log(`Fetched ${messagesWithUserDetails.length} messages for flat ID: ${flatId}`);

        res.json({
            message: `Fetched ${messagesWithUserDetails.length} messages for flat ID: ${flatId}`,
            data: messagesWithUserDetails
        });
    } catch (err) {
        console.error('Error fetching messages:', err.message);
        res.status(500).json({ message: `Error fetching messages: ${err.message}` });
    }
};

// Get Messages on Flat From User
const getUserMessage = async (req, res) => {
    try {
        //const { id: flatId, senderId } = req.params;
        const {id: flatId } = req.params;
        const senderId = req.user._id;
        console.log('flatId', flatId);
        console.log('senderId', senderId);

        console.log(`Fetching messages for flat ID: ${flatId} from sender ID: ${senderId}`);

        const [flat, user, messages] = await Promise.all([
            Flat.findById(flatId),
            User.findById(senderId),
            Message.find({ flatId, senderId }).sort({ createdAt: -1 })
        ]);

        if (!flat) {
            console.log(`Flat not found for ID: ${flatId}`);
            return res.status(404).json({ message: `Flat not found for ID: ${flatId}` });
        }

        if (!user) {
            console.log(`User not found for sender ID: ${senderId}`);
            return res.status(404).json({ message: `User not found for sender ID: ${senderId}` });
        }

        const messagesWithUserDetails = messages.map(message => ({
            ...message.toObject(),
            user: {
                firstName: user.firstName,
                lastName: user.lastName
            }
        }));

        console.log(`Fetched ${messagesWithUserDetails.length} messages for flat ID: ${flatId} from sender ID: ${senderId}`);

        res.json({
            message: `Fetched ${messagesWithUserDetails.length} messages for flat ID: ${flatId} from sender ID: ${senderId}`,
            flat: {
                _id: flat._id,
                city: flat.city,
                streetName: flat.streetName,
                streetNumber: flat.streetNumber,
                areaSize: flat.areaSize,
                hasAc: flat.hasAc,
                yearBuilt: flat.yearBuilt,
                rentPrice: flat.rentPrice,
                dateAvailable: flat.dateAvailable
            },
            messages: messagesWithUserDetails
        });
    } catch (err) {
        console.error('Error fetching messages from user:', err.message);
        res.status(500).json({ message: `Error fetching messages from user: ${err.message}` });
    }
};

// Post Messages
const postMessage = async (req, res) => {
    const { flatId, content } = req.body;
    const senderId = req.user._id;

    if (!senderId || !content) {
        console.log('Invalid request: SenderId and content are required');
        return res.status(400).json({ message: 'SenderId and content are required' });
    }

    const message = new Message({
        flatId,
        senderId,
        content
    });

    try {
        const newMessage = await message.save();
        console.log('Message posted successfully:', newMessage);
        res.status(201).json({
            message: 'Message posted successfully',
            data: newMessage
        });
    } catch (err) {
        console.error('Error posting message:', err.message);
        res.status(400).json({ message: `Error posting message: ${err.message}` });
    }
};

module.exports = { getMessage, getUserMessage, postMessage };
