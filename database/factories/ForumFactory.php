<?php

// Copyright (c) ppy Pty Ltd <contact@ppy.sh>. Licensed under the GNU Affero General Public License v3.0.
// See the LICENCE file in the repository root for full licence text.

use App\Models\Forum\AuthOption;
use App\Models\User;

$factory->defineAs(App\Models\Forum\Forum::class, 'parent', function (Faker\Generator $faker) {
    return [
        'forum_name' => $faker->catchPhrase,
        'forum_desc' => $faker->realtext(80),
        'forum_type' => 0,
        'forum_parents' => [],
        'forum_rules' => '',
    ];
});

$factory->defineAs(App\Models\Forum\Forum::class, 'child', function (Faker\Generator $faker) {
    return [
        'forum_name' => $faker->catchPhrase,
        'forum_desc' => $faker->realtext(80),
        'forum_type' => 1,
        'forum_parents' => [],
        'forum_rules' => '',
    ];
});

$factory->define(App\Models\Forum\Topic::class, function (Faker\Generator $faker) {
    return [
        'topic_poster' => function (array &$self) {
            $factoryUser = factory(User::class)->create();
            $self['topic_first_poster_name'] = $factoryUser->username;

            return $factoryUser->getKey();
        },
        'topic_title' => $faker->catchPhrase,
        'topic_views' => rand(0, 99999),
        'topic_approved' => 1,
        'topic_time' => Carbon\Carbon::createFromTimestamp(rand(1451606400, time())), // random time between 01/01/2016 12am and now
    ];
});

$factory->define(App\Models\Forum\Post::class, function (Faker\Generator $faker) {
    return [
        'poster_id' => function (array &$self) {
            $factoryUser = factory(User::class)->create();
            $self['post_username'] = $factoryUser->username;

            return $factoryUser->getKey();
        },
        'post_subject' => $faker->catchPhrase,
        'post_text' => $faker->realtext(300),
        'post_time' => Carbon\Carbon::createFromTimestamp(rand(1451606400, time())), // random time between 01/01/2016 12am and now
        'post_approved' => 1,
    ];
});

$factory->defineAs(AuthOption::class, 'post', function (Faker\Generator $faker) {
    return [
        'auth_option' => 'f_post',
    ];
});

$factory->defineAs(AuthOption::class, 'reply', function (Faker\Generator $faker) {
    return [
        'auth_option' => 'f_reply',
    ];
});

$factory->defineAs(App\Models\Forum\Authorize::class, 'post', function (Faker\Generator $faker) {
    return [
        'auth_option_id' => function () {
            return AuthOption::where('auth_option', 'f_post')->first() ?? factory(AuthOption::class, 'post');
        },
        'auth_setting' => 1,
    ];
});

$factory->defineAs(App\Models\Forum\Authorize::class, 'reply', function (Faker\Generator $faker) {
    return [
        'auth_option_id' => function () {
            return AuthOption::where('auth_option', 'f_reply')->first() ?? factory(AuthOption::class, 'reply');
        },
        'auth_setting' => 1,
    ];
});
