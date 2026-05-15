#!/usr/bin/env bash

clear

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
SRC_DIR="$SCRIPT_DIR/../src"
BUILD_DIR="$SCRIPT_DIR"
DIST_DIR="$SCRIPT_DIR/dist"
ROOT_DIR="$SCRIPT_DIR/../.."

cat \
  "$SRC_DIR/qd.Common.js" \
  "$SRC_DIR/math/qd.math.js" \
  "$SRC_DIR/math/qd.Point2D.js" \
  "$SRC_DIR/math/qd.Vector2D.js" \
  "$SRC_DIR/math/qd.Vector3D.js" \
  "$SRC_DIR/math/qd.Angle.js" \
  "$SRC_DIR/collections/"*.js \
  "$SRC_DIR/physics/qd.Body.js" \
  "$SRC_DIR/physics/qd.Collision.js" \
  "$SRC_DIR/physics/qd.Physics.js" \
  "$SRC_DIR/physics/qd.BoundingBox.js" \
  "$SRC_DIR/physics/qd.Cloth.js" \
  "$SRC_DIR/physics/qd.DynamicSpring.js" \
  "$SRC_DIR/physics/qd.Kinematics.js" \
  "$SRC_DIR/physics/qd.Spring.js" \
  "$SRC_DIR/graphics/"*.js \
  "$SRC_DIR/io/"*.js \
  "$SRC_DIR/qd.Element.js" \
  "$SRC_DIR/qd.Entity.js" \
  "$SRC_DIR/qd.EntitySet.js" \
  "$SRC_DIR/qd.Layer.js" \
  "$SRC_DIR/qd.World.js" \
  "$SRC_DIR/qd.Engine.js" \
  "$SRC_DIR/editor/"*.js \
  > "$BUILD_DIR/qd.js"

rm -rf "$DIST_DIR"
mkdir -p "$DIST_DIR/js/lib"
mkdir -p "$DIST_DIR/css"
mkdir -p "$DIST_DIR/images"

cp "$BUILD_DIR/qd.js"          "$DIST_DIR/js/"
cp "$SCRIPT_DIR/../lib/jwerty.js" "$DIST_DIR/js/lib/"
cp "$ROOT_DIR/css/style.css"   "$DIST_DIR/css/"
cp "$ROOT_DIR/images/"*        "$DIST_DIR/images/"
cp "$ROOT_DIR/index.html"      "$DIST_DIR/"
cp "$ROOT_DIR/qd.ico"          "$DIST_DIR/"