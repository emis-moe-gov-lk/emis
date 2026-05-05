<?php

namespace App\Contracts;

use App\Models\User;

interface IdentityProvisioningServiceInterface
{
    public function provisionTeacher(User $user, string $plainPassword, bool $resetPassword = false): array;

    public function syncTeacherProfile(User $user): array;
}
