const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function seedUsers() {
    const users = [
        { username: 'VivRose96', email: 'sample@email.com', password_hash: 'hashedpassword!123' }
    ];

    const { data, error } = await supabase.from('users').insert(users);
    if (error) console.error('Error seeding users:', error);
    else console.log('Seeded users:', data);
}

async function seedMovies() {
    const movies = [
        { title: 'Inception', description: 'A thief who steals corporate secrets through use of dream-sharing technology.', release_year: 2010, poster_url: 'url_to_poster' },
        { title: 'Interstellar', description: 'A team of explorers travel through a wormhole in space in an attempt to ensure humanity\'s survival.', release_year: 2014, poster_url: 'url_to_poster' }
    ];

    const { data, error } = await supabase.from('movies').insert(movies);
    if (error) console.error('Error seeding movies:', error);
    else console.log('Seeded movies:', data);
}

async function seedUserMovies() {
    const userMoviesData = [
        { user_id: 1, movie_id: 1, list_type: 'must see' },
        { user_id: 1, movie_id: 2, list_type: 'favorites' }
    ];

    const { data, error } = await supabase
        .from('user_movies')
        .insert(userMoviesData);

    if (error) console.error('Error seeding user_movies:', error);
    else console.log('user_movies seeded:', data);
}

async function seedRatings() {
    const ratingsData = [
        { user_id: 1, movie_id: 1, rating: 5 },
        { user_id: 1, movie_id: 2, rating: 4 }
    ];

    const { data, error } = await supabase
        .from('ratings')
        .insert(ratingsData);

    if (error) console.error('Error seeding ratings:', error);
    else console.log('Ratings seeded:', data);
}

async function seedData() {
    await seedUsers();  
    await seedMovies(); 
    await seedUserMovies();  
    await seedRatings();     
}

seedData().catch(console.error);
