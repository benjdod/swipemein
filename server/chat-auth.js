const jwt = require('jsonwebtoken');

// const CHAT_TOKEN_SECRET = "a super long and complex secret, not to be witnessed or heard by anyone except the designers of this website";
const CHAT_TOKEN_SECRET = "big secret";

exports.signChatToken = (session, id) => {
	return jwt.sign({s: session, p: id}, CHAT_TOKEN_SECRET);
}

exports.verifyChatToken = (token) => {
	try {
		const payload = jwt.verify(token, CHAT_TOKEN_SECRET);
		return payload;
	} catch (e) {
		return '';
	}
}

exports.decodeChatToken = (token) => {
	return jwt.decode(token);
}
