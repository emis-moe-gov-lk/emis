<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class InstitutionLanguages extends Model
{
    use HasFactory;

    protected $table = 'institution_languages';

    protected $primaryKey = 'id';

    protected $fillable = [
        'language_id',
        'name',
    ];
}
