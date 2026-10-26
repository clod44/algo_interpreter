const examples = [
	{
    title: "First Steps",
    description: "ECHO writes without a newline; LINE writes its value and adds a newline afterward.",
    code: `START
LINE 'Hello, algorithm world!'
ECHO 'This stays on the same line. '
LINE 'This starts after it.'
LINE 42
FINISH`
},{
    title: "A Tiny Calculator",
    description: "Store values, combine them with arithmetic, and print the result.",
    code: `START
width = 7
height = 6
area = width * height
LINE 'Width: ' width
LINE 'Height: ' height
LINE 'Area: ' area
FINISH`
},{
    title: "Growing Values",
    description: "Use compound assignment operators to update a value step by step.",
    code: `START
score = 10
score += 5
score *= 2
score -= 4
LINE 'Final score: ' score
FINISH`
},{
    title: "A Countdown Loop",
    description: "Jump back to a source line with GO and stop when the condition changes.",
    code: `START
count = 5
LINE count
count -= 1
IF count > 0 THEN GO 3
LINE 'Blast off!'
FINISH`
},{
    title: "A Guarded Loop",
    description: "Use MAX_STEPS as a built-in safety limit while exploring repetition.",
    code: `START
MAX_STEPS = 8
LINE 'The loop gets a few turns.'
GO 3
FINISH`
},{
    title: "Comments And Composition",
    description: "Leave notes in the program and build a message from several values.",
    code: `START
// The interpreter ignores everything after the comment marker.
name = 'Ada'
language = 'Algo'
LINE 'User: ' name
LINE 'Favorite language: ' language
FINISH`
},{
    title: "The Two-Quote Trick",
    description: "Use opposite quote styles to place quote characters inside strings.",
    code: `START
d = '"'
c = "'"
LINE 'Double quote: ' d
LINE 'Single quote: ' c
LINE d 'Both quote marks can become data.' c
FINISH`
},{
    title: "A Small Decision Machine",
    description: "Combine state, branching, and a jump to model a simple process.",
    code: `START
state = 2
IF state == 1 THEN LINE 'Queued.' ELSE LINE 'In progress.'
IF state == 2 THEN GO 6
LINE 'This line is skipped by the jump.'
LINE 'Finished.'
FINISH`
},{
    title: "Euclidean GCD Machine",
    description: "Compute gcd(1071, 462) with the subtraction form of Euclid's algorithm.",
    code: `START
MAX_STEPS = 1000
a = 1071
b = 462
IF a == b THEN GO 11
IF a > b THEN GO 7 ELSE GO 9
a -= b
GO 5
b -= a
GO 5
LINE 'Greatest common divisor: ' a
FINISH`
},{
    title: "Box Drawer",
    description: "Nested loops drawing outlined or solid 2D geometric shapes.",
    code: `START
width = 12
height = 5
row = 0
IF row == height THEN GO 14
col = 0
IF col == width THEN GO 11
IF row == 0 THEN ECHO '#' ELSE IF row == 4 THEN ECHO '#' ELSE IF col == 0 THEN ECHO '#' ELSE IF col == 11 THEN ECHO '#' ELSE ECHO ' '
col += 1
GO 7
LINE ''
row += 1
GO 5
FINISH`
},{
    title: "Checkerboard Pattern",
    description: "Alternating character grids using coordinate positioning and conditional rendering.",
    code: `START
row = 0
IF row == 8 THEN GO 13
col = 0
IF col == 16 THEN GO 10
rem = (row + col) % 2
IF rem == 0 THEN ECHO '##' ELSE ECHO '..'
col += 1
GO 5
LINE ''
row += 1
GO 3
FINISH`
},{
    title: "2D Voronoi Diagram",
    description: "A 2D spatial scan computing Euclidean distances to two distinct site points to render region boundaries.",
    code: `START
MAX_STEPS = 5000
width = 30
height = 15
ax = 8
ay = 7
bx = 22
by = 15
row = 0
IF row == height THEN GO 25
col = 0
IF col == width THEN GO 22
dx1 = col - ax
dy1 = row - ay
d1 = dx1 * dx1 + dy1 * dy1
dx2 = col - bx
dy2 = row - by
d2 = dx2 * dx2 + dy2 * dy2
IF d1 < d2 THEN ECHO '##' ELSE ECHO '__'
col += 1
GO 12
LINE ''
row += 1
GO 10
FINISH`
},{
    title: "Julia Set Renderer",
    description: "The same complex-plane engine with a fixed Julia constant, making the difference from Mandelbrot visible.",
    code: `START
MAX_STEPS = 500000
LINE "--- Julia Set ---"
width = 40
height = 20
max_iter = 18
row = 0
IF row == height THEN GO 32
y = row / height * 2.0 - 1.0
col = 0
IF col == width THEN GO 29
x = col / width * 3.0 - 1.5
a = x
b = y
iter = 0
aa = a * a
bb = b * b
radius = aa + bb
IF radius > 4.0 THEN GO 26
IF iter == max_iter THEN GO 26
twoab = 2.0 * a * b
a = aa - bb - 0.7
b = twoab + 0.27015
iter += 1
GO 16
IF iter == max_iter THEN ECHO "@@" ELSE ECHO "  "
col += 1
GO 11
LINE ""
row += 1
GO 8
FINISH`
},{
    title: "Mandelbrot Renderer",
    description: "A real nested pixel loop with complex iteration, escape testing, and a computed ASCII frame.",
    code: `START
MAX_STEPS = 500000
LINE "--- Mandelbrot Set ---"
width = 30
height = 20
max_iter = 15
row = 0
IF row == height THEN GO 32
y0 = row / height * 2.2 - 1.1
col = 0
IF col == width THEN GO 29
x0 = col / width * 3.2 - 2.2
a = 0
b = 0
iter = 0
aa = a * a
bb = b * b
aabb = aa + bb
IF aabb > 4.0 THEN GO 26
IF iter == max_iter THEN GO 26
twoab = 2.0 * a * b
a = aa - bb + x0
b = twoab + y0
iter += 1
GO 16
IF iter == max_iter THEN ECHO "@@" ELSE ECHO "  "
col += 1
GO 11
LINE ""
row += 1
GO 8
FINISH`
},{
    title: "ASCII Sphere Raycaster",
    description: "Render a lit sphere in 2D: every cell tests a ray hit, solves surface depth, and selects a shade from the normal.",
    code: `START
MAX_STEPS = 500000
LINE '--- ASCII Sphere Raycaster ---'
width = 48
height = 24
row = 0
IF row == height THEN GO 41
y = 1 - row / height * 2
col = 0
IF col == width THEN GO 38
x = col / width * 2 - 1
sphere = 1 - x * x - y * y
IF sphere < 0 THEN GO 35
z = 1
refine = 0
IF refine == 5 THEN GO 20
z = (z + sphere / z) / 2
refine += 1
GO 16
brightness = x * -0.4 + y * 0.6 + z * 0.7
IF brightness > 0.85 THEN GO 26
IF brightness > 0.6 THEN GO 28
IF brightness > 0.35 THEN GO 30
IF brightness > 0.1 THEN GO 32
GO 32
ECHO '@'
GO 36
ECHO 'O'
GO 36
ECHO '+'
GO 36
ECHO '.'
GO 36
// Pixels outside the sphere, or turned away from the light, are empty.
ECHO ' '
col += 1
GO 10
LINE ''
row += 1
GO 7
LINE 'Each character is a shaded ray hit.'
FINISH`
},{
    title: "Triangle Rasterizer",
    description: "Uses 2D cross-product edge functions to render any arbitrary triangle based on 3 freely adjustable coordinates.",
    code: `START
MAX_STEPS = 20000
width = 40
height = 20
x1 = 20
y1 = 2
x2 = 36
y2 = 18
x3 = 4
y3 = 12
row = 0
IF row == height THEN GO 26
col = 0
IF col == width THEN GO 23
e1 = (col - x1) * (y2 - y1) - (row - y1) * (x2 - x1)
e2 = (col - x2) * (y3 - y2) - (row - y2) * (x3 - x2)
e3 = (col - x3) * (y1 - y3) - (row - y3) * (x1 - x3)
s1 = (e1 >= 0) + (e2 >= 0) + (e3 >= 0)
s2 = (e1 <= 0) + (e2 <= 0) + (e3 <= 0)
IF s1 == 3 THEN ECHO '@@' ELSE IF s2 == 3 THEN ECHO '@@' ELSE ECHO '..'
col += 1
GO 14
LINE ''
row += 1
GO 12
FINISH`
},{
    title: "10 PRINT Maze",
    description: "A procedural labyrinth generated by hashing coordinates to pick diagonal barriers.",
    code: `START
MAX_STEPS = 5000
width = 40
height = 20
row = 0
IF row == height THEN GO 16
col = 0
IF col == width THEN GO 13
h = (row * 13 + col * 29 + row * col) % 2
IF h == 0 THEN ECHO '/' ELSE ECHO '\\'
col += 1
GO 8
LINE ''
row += 1
GO 6
FINISH`
},{
	title: "vCPU Draw",
	description: "Triangle rasterizor with cpu-like structure",
	code: `START
MAX_STEPS = 150000
ptr = 203
x1 = 10
y1 = 1
x2 = 2
y2 = 9
x3 = 18
y3 = 11
eax = 5
ebx = x2
ecx = x1
ret = 15
GO ptr
dx1 = out
eax = 5
ebx = y2
ecx = y1
ret = 21
GO ptr
dy1 = out
eax = 5
ebx = x3
ecx = x2
ret = 27
GO ptr
dx2 = out
eax = 5
ebx = y3
ecx = y2
ret = 33
GO ptr
dy2 = out
eax = 5
ebx = x1
ecx = x3
ret = 39
GO ptr
dx3 = out
eax = 5
ebx = y1
ecx = y3
ret = 45
GO ptr
dy3 = out
row = 0
eax = 10
ebx = row
ecx = 12
edi = 200
ret = 53
GO ptr
col = 0
eax = 10
ebx = col
ecx = 22
edi = 189
ret = 60
GO ptr
eax = 5
ebx = col
ecx = x1
ret = 65
GO ptr
px1 = out
eax = 5
ebx = row
ecx = y1
ret = 71
GO ptr
py1 = out
eax = 6
ebx = px1
ecx = dy1
ret = 77
GO ptr
t1 = out
eax = 6
ebx = py1
ecx = dx1
ret = 83
GO ptr
t2 = out
eax = 5
ebx = t1
ecx = t2
ret = 89
GO ptr
e1 = out
eax = 11
ebx = e1
ecx = 0
edi = 96
ret = 168
GO ptr
eax = 5
ebx = col
ecx = x2
ret = 101
GO ptr
px2 = out
eax = 5
ebx = row
ecx = y2
ret = 107
GO ptr
py2 = out
eax = 6
ebx = px2
ecx = dy2
ret = 113
GO ptr
t1 = out
eax = 6
ebx = py2
ecx = dx2
ret = 119
GO ptr
t2 = out
eax = 5
ebx = t1
ecx = t2
ret = 125
GO ptr
e2 = out
eax = 11
ebx = e2
ecx = 0
edi = 132
ret = 168
GO ptr
eax = 5
ebx = col
ecx = x3
ret = 137
GO ptr
px3 = out
eax = 5
ebx = row
ecx = y3
ret = 143
GO ptr
py3 = out
eax = 6
ebx = px3
ecx = dy3
ret = 149
GO ptr
t1 = out
eax = 6
ebx = py3
ecx = dx3
ret = 155
GO ptr
t2 = out
eax = 5
ebx = t1
ecx = t2
ret = 161
GO ptr
e3 = out
eax = 11
ebx = e3
ecx = 0
edi = 170
ret = 168
GO ptr
inside = 0
GO 171
inside = 1
eax = 9
ebx = 1
ecx = inside
esi = '@@'
edi = '  '
ret = 178
GO ptr
ebx = out
eax = 1
ret = 182
GO ptr
eax = 4
ebx = col
ecx = 1
ret = 187
GO ptr
col = out
GO 54
eax = 2
ebx = ''
ret = 193
GO ptr
eax = 4
ebx = row
ecx = 1
ret = 198
GO ptr
row = out
GO 47
eax = 3
ret = 0
GO ptr
IF eax == 1 THEN ECHO ebx
IF eax == 2 THEN LINE ebx
IF eax == 3 THEN GO ptr + 15
IF eax == 4 THEN out = ebx + ecx
IF eax == 5 THEN out = ebx - ecx
IF eax == 6 THEN out = ebx * ecx
IF eax == 7 THEN out = ebx / ecx
IF eax == 8 THEN out = ebx % ecx
IF eax == 9 THEN out = edi
IF eax == 9 THEN IF ebx <= ecx THEN out = esi
IF eax == 10 THEN IF ebx == ecx THEN GO edi
IF eax == 10 THEN GO ret
IF eax == 11 THEN IF ebx >= ecx THEN GO edi
IF eax == 11 THEN GO ret
GO ret
FINISH`
}
];
