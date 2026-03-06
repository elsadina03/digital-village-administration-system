<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Role;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

class RoleAndUserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Define Roles (5 roles)
        $roles = [
            'Admin Desa',
            'Kepala Desa',
            'Sekretaris Desa',
            'Bendahara',
            'Warga',
        ];

        foreach ($roles as $roleName) {
            Role::firstOrCreate(['name' => $roleName]);
        }

        // Create Default Users for specific roles
        $usersToCreate = [
            ['name' => 'Admin Desa',          'email' => 'admin1@desa.id',      'password' => 'admindesa1',      'role' => 'Admin Desa',        'phone' => '082338232475'],
            ['name' => 'Kepala Desa',         'email' => 'kepdes1@desa.id',     'password' => 'kepdesdesa1',     'role' => 'Kepala Desa',       'phone' => '082229942294'],
            ['name' => 'Bapak Sekretaris',    'email' => 'sekdes1@desa.id',     'password' => 'sekdes1',         'role' => 'Sekretaris Desa',   'phone' => ''],
            ['name' => 'Ibu Bendahara',       'email' => 'bendahara1@desa.id',  'password' => 'bendaharadesa1',  'role' => 'Bendahara',         'phone' => '085959594679'],
            ['name' => 'Budi Warga',          'email' => 'wargadesa1@desa.id',  'password' => 'wargadesa1',      'role' => 'Warga',             'phone' => '082142045987'],
        ];

        foreach ($usersToCreate as $userData) {
            $role = Role::where('name', $userData['role'])->first();
            if ($role) {
                User::updateOrCreate(
                    ['email' => $userData['email']],
                    [
                        'name'          => $userData['name'],
                        'password'      => Hash::make($userData['password']),
                        'role_id'       => $role->id,
                        'active_status' => true,
                        'phone'         => $userData['phone'] ?? null,
                    ]
                );
            }
        }
    }
}
