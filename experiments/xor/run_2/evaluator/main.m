initState = [0.04474573670182397; 1.663108706713805; 0.006291615695511164; 0.03410792836609909];
for bit1 = 0:1
  for bit2 = 0:1
    for bit3 = 0:1
      [state, out] = timestep(bit1, initState(1:2), initState(3:4), true);
      [state, out] = timestep(bit2, state, out);
      [state, out, inVal, inGate, remGate, outGate] = timestep(bit3, state, out);
      s = format_nums([inVal' inGate' remGate' outGate']);
      disp(["| " int2str(bit1) int2str(bit2) int2str(bit3) " | " s]);
    end
  end
end

for bit1 = 0:1
  for bit2 = 0:1
    for bit3 = 0:1
      [state, out] = timestep(bit1, initState(1:2), initState(3:4), true);
      [state, out] = timestep(bit2, state, out);
      [state, out] = timestep(bit3, state, out);
      s = format_nums([state' out']);
      disp(["| " int2str(bit1) int2str(bit2) int2str(bit3) " | " s]);
    end
  end
end
