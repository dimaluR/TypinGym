files = [
    'index.html',
    'style.css',
    'main.js',
]
with open('frontend.txt', 'w') as o:
    for file in files:
        with open(file, 'r') as i:
            o.write(f"file: {file}\n")
            o.write(i.read())
