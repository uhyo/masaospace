#! /bin/sh

# init script of masaospace,
# to be run at /service-masao-space
if [ -n "$INIT_COPY_DIST" ]; then
  # copy dist file to specified directory.
  cp -r ./dist/* $INIT_COPY_DIST
fi

# then, start server.
npm start
