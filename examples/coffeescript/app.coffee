require('../../lib/picard').globalize().start()

# Not much to see here. The only difference:
# run with `coffee app.coffee`

get '/', ->
  text: 'Hello Universe'

get '/redirect/?', (env) ->
  env.redirect('/')