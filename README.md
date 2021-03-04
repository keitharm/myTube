# myTube: Youtube without the bloat

![](http://i.imgur.com/Be2omEM.jpg)
![](http://i.imgur.com/VjE94b5.jpg)

### About
myTube is your own personalized Youtube outlet. Tell it which channels you want to subscribe to, and it will download the videos (using `youtube-dl` and `ffmpeg`) in the highest quality for your viewing pleasure. No more buffering, no more random quality downshifts, no more ads and other crap that you don't care about. The only thing you'll see is exactly what you subscribed to.

### Why?
##### Crappy internet connections
When I was going to college and lived in a small apartment with unbelievable crappy internet, I'd have to load a video I wanted to watch and let it buffer on 720p because 1080p would take forever on my 5 Mbps down connection. Sometimes, Youtube's crappy player would just refuse to work and most of the time I'd actually have to download the video using `youtube-dl` in order to watch it locally on my computer. Also if I was lucky, I'd first have to let some stupid non-skippable ad buffer for a couple minutes so that I could finally choose the 720p option. Most of the time, I'd use the college's internet to download my videos before I headed back to the apartment so that I wouldn't have to deal with Youtube.

##### Amazing internet connections
Even when I came back home to my wonderful 50 up 50 down Mbps connection, Youtube would still struggle. You'd think that the `auto` quality setting would be smart enough to know that my 50/50 connection could handle 1080p. You'd be wrong. Half of the time, it would semi-work and get me to 1080p (and then fluctuate quality to 144p **randomly**), but the other half, it'd just stay at something like 360p the **whole** video! And even if you get it to load in 1080p, it would sometimes just completely stop loading halfway through without any reason whatsover. The only way to "fix" it would be to lower the quality and then reverse it back to your original HD quality or be forced to refresh the page and fast forward to the point you were at before.

##### TL;DR
* Your videos download automatically in whatever quality you desire while you are at school/work and are ready to view without any buffering once you get back home.
* No Ads
* Current progress saved for each video for resuming later.
* Better keyboard controls (see down below)

### Keyboard controls
Youtube has some hidden keys that you can press to manipulate the video, but it is infuriating that you need to have the video element focused in order to press some of the hotkeys. Don't get me started on trying to pause a video with the spacebar only for your entire webpage to SCROLL UP out of view with the video still playing!11!!!

myTube on the other hand doesn't require you to have the video element focused. It just works!
* Spacebar = play/pause
* left/right arrows = backward/forward 5 seconds
* shift + left/right arrows = backward/forward 10 seconds
* 1 - 9 keys = 10% of the video; 0 will start at the beginning
* F to enter full screen
* Escape to exit video viewing mode
* Shake on mobile to go back 5 seconds

### How to Setup
```
git clone https://github.com/keitharm/mytube
cd mytube
```
then read docs.txt

**windows:**
```
install-dep.sh
start.sh
```

**other:**
```
bash install-dep.sh
bash start.sh
```

# Help?
please check docs.txt
