<?php

namespace Database\Seeders;

use App\Models\State;
use Illuminate\Database\Seeder;

class StatesSeeder extends Seeder
{
    public function run(): void
    {
        $states = [
            ['name' => 'Andhra Pradesh', 'code' => 'AP', 'latitude' => 15.9129, 'longitude' => 79.7400],
            ['name' => 'Arunachal Pradesh', 'code' => 'AR', 'latitude' => 28.2180, 'longitude' => 94.7278],
            ['name' => 'Assam', 'code' => 'AS', 'latitude' => 26.2006, 'longitude' => 92.9376],
            ['name' => 'Bihar', 'code' => 'BR', 'latitude' => 25.0961, 'longitude' => 85.3131],
            ['name' => 'Chhattisgarh', 'code' => 'CG', 'latitude' => 21.2787, 'longitude' => 81.8661],
            ['name' => 'Goa', 'code' => 'GA', 'latitude' => 15.2993, 'longitude' => 74.1240],
            ['name' => 'Gujarat', 'code' => 'GJ', 'latitude' => 22.2587, 'longitude' => 71.1924],
            ['name' => 'Haryana', 'code' => 'HR', 'latitude' => 29.0588, 'longitude' => 76.0856],
            ['name' => 'Himachal Pradesh', 'code' => 'HP', 'latitude' => 31.1048, 'longitude' => 77.1734],
            ['name' => 'Jharkhand', 'code' => 'JH', 'latitude' => 23.6102, 'longitude' => 85.2799],
            ['name' => 'Karnataka', 'code' => 'KA', 'latitude' => 15.3173, 'longitude' => 75.7139],
            ['name' => 'Kerala', 'code' => 'KL', 'latitude' => 10.8505, 'longitude' => 76.2711],
            ['name' => 'Madhya Pradesh', 'code' => 'MP', 'latitude' => 22.9734, 'longitude' => 78.6569],
            ['name' => 'Maharashtra', 'code' => 'MH', 'latitude' => 19.7515, 'longitude' => 75.7139],
            ['name' => 'Manipur', 'code' => 'MN', 'latitude' => 24.6637, 'longitude' => 93.9063],
            ['name' => 'Meghalaya', 'code' => 'ML', 'latitude' => 25.4670, 'longitude' => 91.3662],
            ['name' => 'Mizoram', 'code' => 'MZ', 'latitude' => 23.1645, 'longitude' => 92.9376],
            ['name' => 'Nagaland', 'code' => 'NL', 'latitude' => 26.1584, 'longitude' => 94.5624],
            ['name' => 'Odisha', 'code' => 'OD', 'latitude' => 20.9517, 'longitude' => 85.0985],
            ['name' => 'Punjab', 'code' => 'PB', 'latitude' => 31.1471, 'longitude' => 75.3412],
            ['name' => 'Rajasthan', 'code' => 'RJ', 'latitude' => 27.0238, 'longitude' => 74.2179],
            ['name' => 'Sikkim', 'code' => 'SK', 'latitude' => 27.5330, 'longitude' => 88.5122],
            ['name' => 'Tamil Nadu', 'code' => 'TN', 'latitude' => 11.1271, 'longitude' => 78.6569],
            ['name' => 'Telangana', 'code' => 'TG', 'latitude' => 18.1124, 'longitude' => 79.0193],
            ['name' => 'Tripura', 'code' => 'TR', 'latitude' => 23.9408, 'longitude' => 91.9882],
            ['name' => 'Uttar Pradesh', 'code' => 'UP', 'latitude' => 26.8467, 'longitude' => 80.9462],
            ['name' => 'Uttarakhand', 'code' => 'UK', 'latitude' => 30.0668, 'longitude' => 79.0193],
            ['name' => 'West Bengal', 'code' => 'WB', 'latitude' => 22.9868, 'longitude' => 87.8550],
            ['name' => 'Delhi', 'code' => 'DL', 'latitude' => 28.7041, 'longitude' => 77.1025],
            ['name' => 'Jammu & Kashmir', 'code' => 'JK', 'latitude' => 33.7782, 'longitude' => 76.5762],
            ['name' => 'Ladakh', 'code' => 'LA', 'latitude' => 34.1526, 'longitude' => 77.5771],
            ['name' => 'Chandigarh', 'code' => 'CH', 'latitude' => 30.7333, 'longitude' => 76.7794],
        ];

        foreach ($states as $s) {
            State::updateOrCreate(['code' => $s['code']], $s);
        }
    }
}
