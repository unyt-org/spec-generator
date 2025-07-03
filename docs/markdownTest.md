# GitHub Flavored Markdown Syntax

## New! Notes

> [!NOTE]  
> Highlights information that users should take into account, even when skimming.

> [!TIP]
> Optional information to help a user be more successful.

> [!IMPORTANT]  
> Crucial information necessary for users to succeed.

> [!WARNING]  
> Critical content demanding immediate user attention due to potential risks.

> [!CAUTION]
> Negative potential consequences of an action.

## Blockquotes

> Blockquotes are very handy in email to emulate reply text.
> This line is part of the same quote.

> This is one less quote level

This line gets incorporated with the quote because it's only a single newline away

Quote break.

> This is a very long line that will still be quoted properly when it wraps. Oh boy let's keep writing to make sure this is long enough to actually wrap for everyone. Oh, you can *put* **Markdown** into a blockquote. 

## Code and Syntax Highlighting

```javascript
var s = "JavaScript syntax highlighting";
alert(s);
```

```python
s = "Python syntax highlighting"
print s
```

```
No language indicated.
let what = 'will it' + B;

// let's throw in a comment
<b>tag</b>.
```

## Headers 

For H1 and H2, an underline-ish style:

Alt-H1
======

Alt-H2
------

Or the more common 

# H1
## H2
### H3
#### H4
##### H5
###### H6

## Emphasis

Emphasis, aka italics, with *asterisks* or _underscores_.

Strong emphasis, aka bold, with **asterisks** or __underscores__.

Combined emphasis with **asterisks and _underscores_**.

Strikethrough uses two tildes: ~~Scratch this.~~ 

## Horizontal Rule

Three or more...

Hyphens

---

Asterisks

***

Underscores

___

All become a thick horizontal line.

## HTML in Markdown

<dl>
  <dt>Definition list</dt>
  <dd>Is something people use sometimes.</dd>
  <dt>Markdown in HTML</dt>
  <dd>Does *not* work **very** well. Use HTML <em>tags</em>.</dd>
</dl>

For &lt;img&gt; see [***Images***](#images)  

## SUP SUB & PRE

SuperScript<sup>You *can* use **markdown** in ***superscript***</sup>

SubScript<sub>You *can* use **markdown** in ***subscript***</sub>

<pre>      The
       &lt;Pre&gt;
           Tag
    Works    similar    to    ```
But &lt; and &gt; are not escaped around a &lt;word&gt;
This allows <i>some</i> tags in <b>the pre</b> area<sup>Super!</sup></pre>

## HTML Tables

<table>
  <thead>
    <tr><th>HTML</th><th>Tables</th><th colspan="2">Are Possible</th></tr>
    <tr><th colspan="2">Dessert:</th><td>Jello</td><td>Whirrled</td></tr>
  </thead>
  <tbody>
    <tr><td colspan="4" align="center">And more flexible</td></tr>
    <tr><td colspan="4" align="center">since you can use colspan</td></tr>
    <tr><td>And</td><td rowspan="2" colspan="2" align="center">rowspan</td><td>To</td></tr>
    <tr><td>Also</td><td>Boot</td></tr>
  </tbody>
</table>

## Details/Summary

But perhaps the most useful add is that of details/summary

<details><summary><b>Click here</b> for a surprise!</summary>

   
**I'm hidden till I'm not, then**
   
### Sir, Prize!
   
I can use markdown **here in details**, but no markdown in the **summary**.
   
   
</details>

## Images

Here's a logo (hover logo to see the alt text):

Inline-style: 
![don't forget to do alt text](https://avatars.githubusercontent.com/u/42009457?s=40&v=4 "Logo Title Hover Text")

Reference-style: 
![don't forget to do alt text, this is a logo][logo]

And regular HTML img tags work, and allows setting the width or height, and classes for use with pages:

<img width="200" alt="Hi There! Please be descriptive with Alt Text!!" class="recess" src="https://avatars.githubusercontent.com/u/42009457?s=400&u=2dcba5c146315f82f802b8b58e92a4d6b82344b3&v=4">

[logo]: https://avatars.githubusercontent.com/u/42009457?s=40&v=4 "Logo Title Hover Text: The Sequel"

## Links

[I'm an inline-style link](https://www.google.com)

[I'm a reference-style link][Arbitrary case-insensitive reference text]

[You can use numbers][1] for reference-style link definitions

Or leave it empty and use the [link text itself][]

Some text to show that the reference links can follow later. But while we're at it, might as well point out we can use <a href="#Links" class="dismissed">html links</a> too—this is useful if you need to add a class for use with pages/Jeckyl/whatever.

[arbitrary case-insensitive reference text]: https://git.myndex.com
[1]: http://www.myndex.com/APCA/
[link text itself]: http://www.myndex.com/CVD/

## Lists

1. First ordered list item
2. Another item
    * Unordered sub-list, lead with 4 spaces
1. Actual numbers don't matter, just that it's a number
    1. Ordered sub-list, lead with 4 spaces
        1. More sub, lead with 4 spaces
            3. Notice how the numbers can get janky
            1. Notice how the numbers can get janky
        2. previous sub
    2. previous sub
4. And another item.


1. Main level
    1. second level
        1. third level
            - fourth level
        2. third level
    2. Second level
7. main level



Unordered list:

- This is a list
    - This is a sub list, lead with 4 spaces
        - and a further sublist, lead with 4 spaces
            - and still more subing
    - back down a few
    1. add in some ordered stuff
    3. more ordered stuff
        2. sub ordered stuff
            1. Hi There
- Back to the future
   
   Some text that should be aligned with the above item.

* Unordered list can use asterisks
- Or minuses
+ Or pluses

## Line Breaks

Here's a line for us to start with.

This line is separated from the one above by two newlines, so it will be a *separate paragraph*.

This line is also begins a separate paragraph, but,
despite having a single newline, it just gets wrapped together.

This line ends with four white spaces before hitting return.    
So the next line becomes a single new line

## Tables

Colons can be used to align columns.

| Tables        | Are           | Cool  |
| ------------- |:-------------:| -----:|
| col 3 is      | right-aligned | $1600 |
| col 2 is      | centered      |   $12 |
| zebra stripes | are neat      |    $1 |

The outer pipes (|) are optional, and you don't need to make the raw Markdown line up prettily. You can also use inline Markdown.

Markdown | Less | Pretty
--- | --- | ---
*Still* | `renders` | **nicely**
1 | 2 | 3


## Footnotes

Here is a simple footnote[^1].

A footnote can also have multiple lines[^2].

[^1]: My reference.
[^2]: To add line breaks within a footnote, prefix new lines with 2 spaces.
  This is a second line.

## Math Equasions

$$
\int_{-\infty}^{\infty} e^{-x^2} dx = \sqrt{\pi}
$$

## Group Icons Plugin 

::: code-group

```sh [npm]
npm install vitepress-plugin-group-icons
```

```sh [yarn]
yarn add vitepress-plugin-group-icons
```

```sh [pnpm]
pnpm add vitepress-plugin-group-icons
```

```sh [bun]
bun add vitepress-plugin-group-icons
```

:::

## Timeline

::: timeline 2023-05-24
- **do some thing1**
- do some thing2
:::

::: timeline 2023-05-23
do some thing3
do some thing4
:::