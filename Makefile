foo.js: baz.js
	echo "hello" > foo.js

baz.js: bux.js
	echo "hi!" > baz.js
