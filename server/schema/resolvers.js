const { Book, User } = require('../models');
const { AuthenticationError } = require('apollo-server-express');
const { signToken } = require('../utils/auth');

const resolvers = {
    Query: {
        me: async (parent, args, context) => {
            if (context.user) {
                const userData = await User.findOne({ _id: context.user._id }).select('-__v -password');
                return userData;
            }
            throw new AuthenticationError("Not logged in!");
        }
    },
    Mutation: {
        addUser: async (parent, { username, email, password }) => {
            const user = await User.create({ username, email, password });
            const token = signToken(user);
            return { token, user };
        },
        login: async (parent, { email, password }) => {
            const user = await User.findOne({ email });

            if (!user) {
                throw new AuthenticationError('User not found')
            }

            const corretPassword = await user.isCorrectPassword(password);

            if (!correctPassword) {
                throw new AuthenticationError('Incorrect Password');
            }

            const token = signToken(user);
            return { token, user };
        }, 
        saveBook: async (parent, args, context) => {
            if (context.user) {
                const newUser = await User.findByIdAndUpdate(
                    { _id: context.user._id},
                    { $addToSet: { savedBooks: args.bookData} },
                    { new: true, runValidators: true }
                );
                return newUser; 
            }
            throw new AuthenticationError("Please, Log In");
        },
        deleteBook: async (parent, args, context) => {
            if(context.user) {
                const updateUser = await User.findOneAndUpdate(
                    {_id: context.user._id},
                    { $pull: { savedBooks: {bookId: args.bookId } } },
                    { new: true }
                );
                return updateUser;
            }
            throw new AuthenticationError("Please, Log In");
        }


    }
}

module.exports = resolvers;