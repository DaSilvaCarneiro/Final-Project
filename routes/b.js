const bcrypt = require('bcrypt');

const myFunction = async () => {
    const saltRounds = 10;
    const someOtherPlaintextPassword = 'not_bacon';

    // Hashing password
    const salt = await bcrypt.genSalt(saltRounds);
    const hash = await bcrypt.hash(someOtherPlaintextPassword, salt);
    console.log(`Original Password: ${someOtherPlaintextPassword}`);
    console.log(`Hashed Password: ${hash}`);
    console.log(`Salt: ${salt}`);

    // Comparing password
    const result = await bcrypt.compare('not_bacon', hash);
    console.log('Comparison Result:', result);
}

myFunction().catch(console.error);
