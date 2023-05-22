#!/bin/bash

inputFile=$1
outputFile=$2

output=$(jq -c '[foreach .[] as $item (0; .+1; {title: ("Inscription #" + (.-1 | tostring)), type: ("BTCORD-" + (.-1 | tostring)), network: "btc.btc", detail: "Inscription", rate: 1, isNFT: true, img_url: ("http://localhost/content/" + $item.inscription), balance: 1, options: [{type: "paddingAmount", title: "Padding Amount", value: 4000}], info: {inscription: $item.inscription, location: $item.location, explorer: $item.explorer}})]' $inputFile | jq -M '.')

echo "export const INSCRIPTIONS = $output" > $outputFile
