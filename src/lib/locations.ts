

export const KENYAN_COUNTIES = [
    'Baringo', 'Bomet', 'Bungoma', 'Busia', 'Elgeyo-Marakwet', 'Embu', 'Garissa', 
    'Homa Bay', 'Isiolo', 'Kajiado', 'Kakamega', 'Kericho', 'Kiambu', 'Kilifi', 
    'Kirinyaga', 'Kisii', 'Kisumu', 'Kitui', 'Kwale', 'Laikipia', 'Lamu', 'Machakos',
    'Makueni', 'Mandera', 'Marsabit', 'Meru', 'Migori', 'Mombasa', 'Muranga', 
    'Nairobi', 'Nakuru', 'Nandi', 'Narok', 'Nyamira', 'Nyandarua', 'Nyeri', 
    'Samburu', 'Siaya', 'Taita-Taveta', 'Tana River', 'Tharaka-Nithi', 
    'Trans-Nzoia', 'Turkana', 'Uasin Gishu', 'Vihiga', 'Wajir', 'West Pokot'
];

// Define which counties fall into which delivery zone
export const MAJOR_TOWNS_COUNTIES = [
    'Kiambu', 'Kisumu', 'Machakos', 'Mombasa', 'Nakuru', 'Uasin Gishu'
];

export const getDeliveryZone = (county: string): 'nairobi' | 'majorTowns' | 'remote' => {
    if (county === 'Nairobi') {
        return 'nairobi';
    }
    if (MAJOR_TOWNS_COUNTIES.includes(county)) {
        return 'majorTowns';
    }
    return 'remote';
};
