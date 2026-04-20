<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\HasMany;

class SubjectList extends Model
{
    use HasFactory;

    protected $table = 'subject_lists';
    protected $primaryKey = 'id';

    protected $fillable = [
        'subject_id',
        'subject_code',
        'name_en',
        'name_si',
        'name_ta',
        'type',
        'grade_mask',
        'language_mask',
        'category_mask',
        'active_status',
    ];

    protected $casts = [
        'type' => 'integer',
        'active_status' => 'boolean',
    ];

    /**
     * Scope: Only active rows
     */
    public function slots(): HasMany
    {
        return $this->hasMany(Slot::class, 'subject_id');
    }

    public function subjectColors(): HasMany
    {
        return $this->hasMany(SubjectColor::class, 'subject_id');
    }

    public function scopeActive($query)
    {
        return $query->where('active_status', 1);
    }

    /**
     * Scope: Filter by type
     * Example: SubjectList::type(1)->get();
     */
    public function scopeType($query, $type)
    {
        return $query->where('type', $type);
    }


    /**
     * Get the type name
     * Example: $subjectList->type_name;
     */
    public function getTypeNameAttribute()
    {
        return match($this->type) {
            1 => 'Subject',
            2 => 'Designation',
            3 => 'Other',
            default => 'Unknown',
        };
    }

    // Optional constants for readability
    public const GRADE_NOT_OFFERED = '0';
    public const GRADE_MANDATORY   = '1';
    public const GRADE_OPTIONAL    = '2';

    /**
     * Get rule for a single grade (1–13).
     */
    public function ruleForGrade(int $grade): ?string
    {
        if ($grade < 1 || $grade > 13) {
            return null;
        }

        // PHP string index is 0-based, grade is 1-based
        $index = $grade - 1;

        return $this->grade_mask[$index] ?? null;
    }

    /**
     * Convenience helpers.
     */
    public function isMandatoryForGrade(int $grade): bool
    {
        return $this->ruleForGrade($grade) === self::GRADE_MANDATORY;
    }

    public function isOptionalForGrade(int $grade): bool
    {
        return $this->ruleForGrade($grade) === self::GRADE_OPTIONAL;
    }

    public function isOffForGrade(int $grade): bool
    {
        return $this->ruleForGrade($grade) === self::GRADE_NOT_OFFERED;
    }

    /**
     * Set rule for one grade (1–13) and update mask string.
     */
    public function setRuleForGrade(int $grade, string $rule): void
    {
        if ($grade < 1 || $grade > 13) {
            return;
        }

        $mask = str_pad($this->grade_mask ?? '', 13, '0'); // ensure length 13
        $index = $grade - 1;

        $mask[$index] = $rule;
        $this->grade_mask = $mask;
    }

    /**
     * Usage example:
     * $subjectList->setRulesForGrades([
     *     1 => self::GRADE_MANDATORY,
     *     2 => self::GRADE_OPTIONAL,
     *     3 => self::GRADE_NOT_OFFERED,
     *     // ...
     * ]);
     */
    
    public function scopeMandatoryForGrade(Builder $query, int $grade): Builder
    {
        return $query->whereRaw(
            'SUBSTRING(grade_mask, ?, 1) = ?',
            [$grade, self::GRADE_MANDATORY]
        );
    }

    public function scopeOptionalForGrade(Builder $query, int $grade): Builder
    {
        return $query->whereRaw(
            'SUBSTRING(grade_mask, ?, 1) = ?',
            [$grade, self::GRADE_OPTIONAL]
        );
    }

    /**
     * usage example:
     * $subjectList->mandatoryForGrade(1)->get();
     */

    public function scopeOfferedForGrade(Builder $query, int $grade): Builder
    {
        return $query->whereRaw(
            'SUBSTRING(grade_mask, ?, 1) IN ("1","2")',
            [$grade]
        );
    }

    /**
     * usage example:
     * $subjectList->offeredForGrade(1)->get();
     */

    public function scopeOfferedForGradeRange(Builder $query, int $from, int $to): Builder
    {
        $query->where(function ($q) use ($from, $to) {
            for ($grade = $from; $grade <= $to; $grade++) {
                $q->orWhereRaw('SUBSTRING(grade_mask, ?, 1) IN ("1","2")', [$grade]);
            }
        });

        return $query;
    }

    /**
     * usage example:
     * $subjectList->offeredForGradeRange(1, 13)->get();
     */

    public function scopeHasLanguage(Builder $query, string $language): Builder
    {
        // Language positions based on Option B
        $map = [
            'Sinhala' => 0,
            'Tamil'   => 1,
            'English' => 2,
            'Other'   => 3,
        ];

        if (!isset($map[$language])) {
            return $query; // do nothing if invalid language
        }

        $position = $map[$language] + 1; // SQL substring index starts at 1

        return $query->whereRaw(
            'SUBSTRING(language_mask, ?, 1) = "1"',
            [$position]
        );
    }

    /**
     * usage example:
     * $subjectList->hasLanguage('Sinhala')->get();
     */

    public function categoryForGrade(int $grade): int
    {
        if ($grade < 1 || $grade > 13) {
            return 0;
        }

        return (int) $this->category_mask[$grade - 1];
    }

    /**
     * usage example:
     * $subjectList->categoryForGrade(1)->get();
     */

    public function scopeHasCategoryInRange(
        Builder $query,
        int $fromGrade,
        int $toGrade,
        int $categoryCode
    ): Builder {
        return $query->where(function ($q) use ($fromGrade, $toGrade, $categoryCode) {
            for ($grade = $fromGrade; $grade <= $toGrade; $grade++) {
                $q->orWhereRaw(
                    'SUBSTRING(category_mask, ?, 1) = ?',
                    [$grade, (string) $categoryCode]
                );
            }
        });
    }

    /**
     * usage example:
     * $subjectList->hasCategoryInRange(1, 13, 1)->get();
     */

    public function scopeCategoryForFullRange(
        Builder $query,
        int $fromGrade,
        int $toGrade,
        int $categoryCode
    ): Builder {
        return $query->where(function ($q) use ($fromGrade, $toGrade, $categoryCode) {
            for ($grade = $fromGrade; $grade <= $toGrade; $grade++) {
                $q->whereRaw(
                    'SUBSTRING(category_mask, ?, 1) = ?',
                    [$grade, (string) $categoryCode]
                );
            }
        });
    }

    /**
     * usage example:
     * $subjectList->categoryForFullRange(1, 13, 1)->get();
     */


}
