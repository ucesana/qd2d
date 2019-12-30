#!/usr/bin/env bash

clear

cd ../src

cat qd.Common.js \
  math/qd.math.js math/qd.Point2D.js math/qd.Vector2D.js math/qd.Vector3D.js math/qd.Angle.js \
  collections/*.js \
  physics/qd.Body.js physics/qd.Collision.js physics/qd.Physics.js physics/qd.BoundingBox.js physics/qd.Cloth.js physics/qd.DynamicSpring.js physics/qd.Kinematics.js physics/qd.Spring.js \
  graphics/*.js \
  io/*.js \
  qd.Element.js \
  qd.Entity.js \
  qd.EntitySet.js \
  qd.Layer.js \
  qd.World.js \
  qd.Engine.js \
  editor/*.js \
  > ../build/qd.js

cd ..
rm -rf dist
mkdir dist
mkdir -p dist/js
mkdir -p dist/js/lib
mkdir -p dist/css
mkdir -p dist/images
cd dist

cp ../build/qd.js ./js
cp ../lib/jwerty.js ./js/lib/
cp ../../css/style.css ./css/
cp ../../images/* ./images/
cp ../../index.html .
cp ../../qd.ico .

cd ../..


