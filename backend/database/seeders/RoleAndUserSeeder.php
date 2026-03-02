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
        // Define Roles
        $roles = [
            'Kepala Desa',
            'Sekretaris Desa',
            'Bendahara',
            'Warga'
        ];

        foreach ($roles as $roleName) {
            Role::firstOrCreate(['name' => $roleName]);
        }

        // Create Default Users for specific roles
        $usersToCreate = [
            ['name' => 'Bapak Kepala Desa', 'email' => 'kepdes@desa.id', 'role' => 'Kepala Desa'],
            ['name' => 'Bapak Sekretaris Desa', 'email' => 'sekdes@desa.id', 'role' => 'Sekretaris Desa'],
            ['name' => 'Ibu Bendahara', 'email' => 'bendahara@desa.id', 'role' => 'Bendahara'],
            ['name' => 'Budi Warga', 'email' => 'warga@desa.id', 'role' => 'Warga'],
        ];

        foreach ($usersToCreate as $userData) {
            $role = Role::where('name', $userData['role'])->first();
            if ($role) {
                User::firstOrCreate(
                    ['email' => $userData['email']],
                    [
                        'name' => $userData['name'],
                        'password' => Hash::make('password123'),
                        'role_id' => $role->id,
                        'active_status' => true,
                    ]
                );
            }
        }
    }
}
