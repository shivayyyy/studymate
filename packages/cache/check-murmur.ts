
import murmurhash from 'murmurhash';

try {
    const hash = murmurhash.v3('test', 0);
    console.log('MurmurHash v3:', hash);
} catch (e) {
    console.error('Error:', e);
}
