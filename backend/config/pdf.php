<?php

return [
	'mode'                  => 'utf-8',
	'format'                => 'A4',
	'author'                => 'Madusanka',
	'subject'               => 'samis',
	'keywords'              => '',
	'creator'               => 'Laravel Pdf',
	'display_mode'          => 'fullpage',
	'tempDir'               => base_path('../temp/'),
	'pdf_a'                 => false,
	'pdf_a_auto'            => false,
	'icc_profile_path'      => '',
    'defaultCssFile'        => false,
    'pdfWrapper'            => 'misterspelik\LaravelPdf\Wrapper\PdfWrapper',
	'default_font'          => 'sans-serif',
	'default_font_size'   	=> '12',
	'margin_left'           => 10,
    'margin_right'         	=> 10,
    'margin_top'            => 10,
    'margin_bottom'         => 20,
    'margin_header'         => 10,
    'margin_footer'         => 10,
    'orientation'           => 'P',

    'autoLangToFont' => true, // Automatically selects font for specific languages
    'autoScriptToLang' => true, // Automatically sets the script to language

	'font_path' => storage_path('fonts/'),
	'font_cache' => storage_path('fonts/'),
    'font_data' => [
		'iskolapotha' => [
			'R'  => 'IskolaPotha.ttf',    // Regular font
			'useOTL' => 0xFF, // Enables OpenType Layout Tables (required for shaping)
    		'useKashida' => 75, // Adjust text justification for scripts like Sinhala
		],

		'abhayalibre' => [ // must be lowercase and snake_case
            'R'  => 'AbhayaLibre-Regular.ttf',    // regular font
            'B'  => 'AbhayaLibre-Bold.ttf',       // optional: bold font
			'useOTL' => 0xFF, // Enables OpenType Layout Tables (required for shaping)
    		'useKashida' => 75, // Adjust text justification for scripts like Sinhala
        ],

		'hindmadurai' => [ // must be lowercase and snake_case
            'R'  => 'HindMadurai-Regular.ttf',    // regular font
            'B'  => 'HindMadurai-Bold.ttf',       // optional: bold font
			'useOTL' => 0xFF, // Enables OpenType Layout Tables (required for shaping)
    		'useKashida' => 75, // Adjust text justification for scripts like Sinhala
        ],
    ]
];
