`curl --silent 'http://localhost:9900' > /dev/null`

if $? != 0
  puts "Node app not running"
  puts "Make sure it's running on port 9900"
  exit
end

`curl --silent 'http://localhost:3000' > /dev/null`

if $? != 0
  puts "Sinatra app not running"
  puts "Make sure it's running on port 3000"
  exit
end

puts "\nRunning Sinatra specs 10 times:\n\n"
sin_sum = 0
10.times do 
  out = `rake | grep Finished`
  puts out
  sin_sum += out.split[2].to_f
end

puts "Average time was #{sin_sum / 10.0} seconds"

puts "\nRunning Picard specs 10 times:\n\n"
node_sum = 0
10.times do 
  out = `cd ../sample_app; rake | grep Finished`
  puts out
  node_sum += out.split[2].to_f
end

puts "Average time was #{node_sum / 10.0} seconds"

if node_sum < sin_sum
  puts "\nPicard was #{ sprintf("%.2f", (sin_sum / node_sum)) } times faster!"
end
