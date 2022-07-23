import mongoose from 'mongoose';
import config from 'config';
import bcrypt from 'bcrypt';
import { Role } from '../types/enums';
import { UserDocument } from '../types/interfaces';


const userSchema = new mongoose.Schema(
    {
        username: { type: String, required: true, unique: true },
        password: { type: String, required: true },
        deposit: { type: Number, required: true },
        role: { type: Number, required: true }
    },
    {
        timestamps: true,
    }
);

userSchema.pre("save", async function (next) {
    let user = this as UserDocument;

    if (!user.isModified("password")) {
        return next();
    }

    const salt = await bcrypt.genSalt(config.get<number>("saltWorkFactor"));
    const hash = bcrypt.hashSync(user.password, salt);

    user.password = hash;

    return next();
});

userSchema.methods.comparePassword = async function (candidatePassword: string): Promise<boolean> {
    const user = this as UserDocument;
    return bcrypt.compare(candidatePassword, user.password).catch((error) => false);
}

const User = mongoose.model("User", userSchema);

export default User;