## weh API

### weh(function (site))

Builds a site. This function takes another function that describes how the site
is built. Basically, it looks like this:

```js
weh(async site => {
  // your site definition here
  return site
})
```

This function takes a `site` parameter. This parameter is responsible for
configuring your entire site, and all of its methods are documented below.

This function needs to return `site`, wrapped in a promise. Thankfully,
making it return a promise is as easy as using the `async` keyword
(see the above example).

### weh.integration(function (site), files)

Basically the same as `weh()`, but sets `dry_run` to true and accepts an array
of files to set as `config.files`, in order to override the read process.
Used in integration tests for plugins.

### site.config(conf)

Configures your site with either a specified config object or the default config.
You don't _need_ to call this function in your build process - if you omit it,
`weh` will use the [default config] instead, though you'd probably want to
adjust your source and destination paths.

### site.use(plugin, [options])

Registers a plugin to be used in the build process. See [plugin structure] for
more information on how to write plugins.

The `options` argument is optional and can be used to pass plugin-specific
options. It should be an object, although that is up to each plugin to
decide.

### Default Configuration

This is an exhaustive list of all `weh` config options:

- __source__: The source directory where files are being read from. The default
  is the directory you're running `weh` from.
- __destination__: The directory `weh` will place built files into. The default
  is the directory you're in + `_site` (just like Jekyll!)
- __dry_run__: Whether to skip writing completely. This is useful if you want to run
  automated tests without writing to disk. Default is `false`.
- __files__: An array that will override `site.files` when `dry_run` is also set to true.
- __exclude__: Files and directories to exclude when reading. The default is:

```
node_modules/
package.json
bower_components/
coverage/
```

If you have any suggestions on what should be excluded by default, please open
an issue!

## Plugin Structure

The plugin itself is a function. It can take an optional `options`
parameter, which the user can pass through in the `site.use` call:

```js
const plugin = (opts = {}) => {
  // do something cool
}
```

It's best to set this to `{}` as a default to prevent unwanted errors, even
if your plugin isn't taking any options.

A plugin should return a function or an array of tuples (pairs of two). You
should only return an array if you need to hook into multiple points of the
build process. The default position in the build chain is after reading, but
before writing to disk. This should be enough for most plugins.

Hooking into multiple points would look like this:

```js
const plugin = () => {
  return [
    ['pre_read', files => {
      // do something
    }], ['post_write', files => {
      // do something else
    }]
  ]
}
```

While just hooking after reading looks like this:

```js
const plugin = () => {
  return files => {
    // do something
  }
}
```

There are four points where you can hook into:

```
pre_read
post_read
pre_write (the default)
post_write
```

All of them receive the same parameter in their function, namely the `files`
parameter. This is a very big array that contains all of the data collectible
from the source fileset. It looks a little something like this:

```js
[
  {
    path: 'file.md',
    absolutePath: '/Users/username/project/file.md',
    contents: 'hello! this is content',
    stats: [Object]
  },
  {
    path: 'directory/cool.md',
    absolutePath: '/Users/username/project/directory/cool.md',
    contents: 'this is a cooler file',
    stats: [Object]
  },
  {
    path: 'directory/image.png',
    absolutePath: '/Users/username/project/directory/image.png',
    contents: [Buffer],
    stats: [Object]
  }
]
```

(`stats` is an instance of [`fs.Stats`][fs-stats])

If `weh` stumbles upon a binary file, it is kept in a buffer structure, because
converting it to a string would effectively break the file. You can filter
binary files from your fileset like this:

```js
const onlyTextFiles = files.filter(file => typeof file.contents === 'string')
```

And that's it! You can modify all of the parts you want, just be sure to return
the (modified) `files` object at the end.

So, to recap, your plugin might look a little like this:

```js
const plugin = opts => {
  return files => files.map(file => file.contents = opts)
}

// ...omit weh initialization
site.use(plugin, 'haha i\'ve replaced your file!')
// ...omit other weh stuff
```

Of course, you can put this into a npm module and publish it for the world to
see! I advise that you add the `weh` tag to your package so that it remains
discoverable.

[default config]: #default-configuration
[plugin structure]: #plugin-structure
[fs-stats]: https://nodejs.org/dist/latest-v6.x/docs/api/fs.html#fs_class_fs_stats
