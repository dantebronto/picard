require('../../lib/picard').globalize().start()

# Not much to see here. The only difference:
# compile or run with `coffee app.coffee`

get '/', -> 'Wicked short route' 

get '/redirect/?', (env) ->
  env.redirect('/')